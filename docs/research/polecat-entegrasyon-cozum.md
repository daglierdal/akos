# Polecat Entegrasyon Cozumleri

Bu dokuman, `gt` ile Codex ve Gemini runtime'lari arasindaki polecat entegrasyon sorunlarini inceler ve kalici cozum tasarimi onerir.

Incelenen alanlar:

- `gt config agent` ve town-level agent tanimlari
- `gt sling` dispatch davranisi
- `tmux` session ve pane entegrasyonu
- repo icindeki [`.codex/instructions.md`](/Users/akrotesbot/gt/akos/polecats/nuka/akos/.codex/instructions.md)
- worktree/home altindaki `.gemini` yapilandirmalari
- runtime state ve `.runtime/` davranisi

## Ozet

Mevcut kurulumda Gemini ile Codex ayni "agent" soyutlamasi altinda gorunuyor ama gercekte farkli launch kontratlari kullaniyor:

- Gemini session'lari prompt ile baslatiliyor ve `.gemini/settings.json` hook'lariyla `gt prime --hook` + `gt mail check --inject` calisiyor.
- Codex session'lari prompt'suz baslatiliyor, worktree'ye hook konfigi yazilmiyor, `nudge-poller` da polecat'ler icin acilmiyor.
- `codex` town-level custom agent olarak override edilmis; bu da built-in Codex metadata'sini gomuyor.

Sonuc: `gt`, Codex'i "provider=codex" olarak taniyor ama isletim modelini Claude/Gemini kadar tam anlamiyor. Kalici cozum, runtime-spesifik hack degil; GT icinde tek bir "interactive agent contract" tanimlayip her provider'a bunu adapte etmek.

## Bulgular

### 1. Codex prompt ile baslamiyor

Kanıtlar:

- `codex --help` ciktisina gore CLI positional `[PROMPT]` destekliyor.
- Aktif Gemini prosesleri `gemini ... -i [GAS TOWN] ...` ile prompt aliyor.
- Aktif Codex prosesleri `codex --dangerously-bypass-approvals-and-sandbox --no-alt-screen` seklinde basliyor; prompt arg yok.
- Town config'te [config.json](/Users/akrotesbot/gt/settings/config.json) icindeki `codex` agent'i custom override olarak tanimli.

Kök neden:

- Sorun Codex CLI'da degil, GT launcher katmaninda.
- `gt sling` / session start akisi Gemini icin "initial prompt" geciriyor, Codex icin gecirmiyor.
- Custom `codex` tanimi built-in launch semantigini da ezmis gorunuyor.

Kalici cozum:

- GT icinde provider-agnostic bir `InitialPromptSpec` tanimlanmali:
  - `interactive_prompt`
  - `resume_token`
  - `session_id_env`
  - `supports_hooks`
- Provider adapter'lari:
  - Gemini: `gemini -i <prompt>`
  - Claude: mevcut davranis
  - Codex: `codex <prompt>` veya gerekiyorsa `codex -- <prompt>` degil, resmi positional prompt kontrati
- Spawn path, `gt sling`, `gt handoff`, `gt witness restart`, `gt session start` ve dog/polecat launch code path'lerinde ortak kullanilmali.

Uygulama notu:

- `gt config agent set codex "codex --dangerously-bypass-approvals-and-sandbox --no-alt-screen"` seklindeki custom override kaldirilmali ya da baska isimle (`codex-inline`) tanimlanmali.
- Built-in `codex` preset korunmali; ek flag gerekiyorsa "extra args" katmani built-in preset'in ustune merge edilmeli.

### 2. Hook nudge Codex/Gemini session'lara ulasmiyor

Kanıtlar:

- Gemini worktree'lerinde `.gemini/settings.json` var ve `SessionStart`, `PreCompress`, `BeforeAgent` hook'lari `gt prime --hook` ve `gt mail check --inject` cagiriyor.
- Bu worktree'de sadece [`.codex/instructions.md`](/Users/akrotesbot/gt/akos/polecats/nuka/akos/.codex/instructions.md) var; `.codex` altinda hook konfigurasyonu yok.
- `gt config agent get codex` ciktisinda `Session ID Env`, `Resume Style`, `Supports Hooks` alanlari yok; `claude` ve `gemini` icin var.

Kök neden:

- Gemini tarafinda hook-tabanli drain var, Codex tarafinda yok.
- Codex custom agent override'i, GT'nin built-in Codex metadata'sini dusuruyor.
- Bu nedenle GT session'i bulsa bile "hook ile enjekte et" yolunu kuramiyor.

Kalici cozum:

- GT icinde provider metadata runtime config'ten ayrilmali.
- `provider=codex` ise built-in provider capability map her durumda uygulanmali:
  - session id env
  - resume strategy
  - hook support
  - prompt strategy
- Codex icin repo/worktree bootstrap adimi eklenmeli:
  - `.codex/agent.toml` veya `.codex/config.toml.d/gastown.toml`
  - SessionStart benzeri davranis GT tarafindan wrapper ile saglanmali
- Dogrudan "Codex'te native hook yok" varsayimina kilitlenmemek gerek. Hook yoksa GT wrapper process'i ayni isi yapmali:
  - session baslarken `gt prime --hook`
  - her nudge oncesi/sonrasi queue drain
  - compaction/resume sirasinda session_id persist

Tasarim onerisi:

- `gt agent runtime wrap codex -- <cmd...>` benzeri tek bir wrapper olsun.
- Wrapper sorumluluklari:
  - `GT_SESSION_ID` uret/persist et
  - worktree `.runtime/session_id` yaz
  - ilk prompt'u inject et
  - queue dosyasini drain et
  - exit durumunda cleanup yap

Bu cozum Gemini'yi de wrapper altina alirsa davranislar eslenir ve provider farki azalir.

### 3. `nudge-poller` polecat'ler icin calismiyor

Kanıtlar:

- Calisan proseslerde `gt nudge-poller` sadece `ak-witness`, `te-witness`, `ak-refinery`, `te-refinery` icin var.
- Polecat session'lari icin `nudge-poller` prosesi yok.
- `gt nudge --help` ciktisi, Claude disi ajanlarin background `nudge-poller` ile drain edildigini soyluyor.

Kök neden:

- GT polecat'leri hala "Claude-centric" bir varsayimla ele aliyor olabilir: polecat ya hook'tan alir ya da dogrudan tmux inject edilir.
- Gemini polecat'lerinde hook dosyalari var ama polecat sinifi icin poller supervisor baslatilmiyor.
- Codex polecat'lerinde ise hem hook yok hem poller yok; en kirilgan durum bu.

Kalici cozum:

- `nudge-poller` session role'a degil capability'ye baglanmali.
- Kural:
  - `supports_user_prompt_hook=true` ise hook-drain yeterli olabilir
  - `supports_user_prompt_hook=false` ise poller zorunlu
  - `provider=gemini|codex` ve `interactive=true` ise polecat dahil her session icin poller ac
- Supervisor, `gt polecat start`, `gt witness start`, `gt refinery start`, `gt dog start` gibi tum session acilis yollarinda ortak olsun.

Uygulama detaylari:

- Poller hedefi tmux session name ile degil, `.runtime/session_id` + pane id cache ile calismali.
- Pane id stale ise poller `tmux list-panes` ile current path/surrogate identity uzerinden yeniden resolve etmeli.
- `gt nudge` sync path'i "wait-idle -> queue -> poller deliver" seklinde normalize edilmeli.

### 4. `.runtime/` git'te tracked olunca stale lock olusuyor

Kanıtlar:

- Git gecmisinde `6bee648 fix: untrack .runtime/ and add to .gitignore` commit'i acikca bu sorunu duzelttigini soyluyor.
- Commit metni: tracked `.runtime/agent.lock` ve `session_id` yeni worktree'lere stale state tasiyordu.
- Aktif lock dosyalari pane/session bilgisi tutuyor; bunlar git'e girerse yeni worktree'de yanlis session hedeflenir.

Kök neden:

- `.runtime/` gecici local state, ama bir ara repository state gibi davranmis.
- `agent.lock`, `agent.lock.flock`, `session_id`, `last_handoff_ts` gibi dosyalar branch/worktree'ye kopyalaninca session kimligi kirleniyor.

Kalici cozum:

- `.runtime/` kesin olarak source tree disina alinmali.
- En dogru model:
  - repo ici gecici state yerine `~/.local/state/gastown/worktrees/<hash>/`
  - worktree icinde sadece symlink veya pointer dosyasi
- Boylece git ignore'a guvenmek zorunda kalinmaz.

Tercih edilen tasarim:

1. Worktree root hash'i hesapla.
2. Runtime state'i `XDG_STATE_HOME/gastown/runtime/<worktree-id>/` altina yaz.
3. Repo icinde `.runtime/` gerekiyorsa symlink olsun; yoksa hic olmasin.
4. Lock acquire sirasinda PID, hostname, started_at kontrol edilerek stale lock otomatik kirilsin.

Ek kural:

- GT doctor'a yeni check eklenmeli:
  - tracked `.runtime/` var mi
  - `.runtime` regular dir mi yoksa symlink mi
  - lock PID hala yasiyor mu

### 5. Codex TUI cift-Enter sorunu

Kanıtlar:

- Polecat Codex session'lari `--no-alt-screen` ile aciliyor.
- `gt nudge` ve `session inject` tmux send-keys temelli fallback kullaniyor.
- `gt nudge --help`, `immediate` modun tmux send-keys ile dogrudan inject ettigini acikca soyluyor.
- Codex inline TUI, tmux icinde normal shell prompt'u gibi davranmadigi icin "metni yaz + Enter" akisi kirilgan.

Bu noktada sebep hakkinda bir cikarim yapiyorum:

- Ilk Enter, Codex input editor state'ini finalize ediyor olabilir.
- Ikinci Enter gercek submit oluyor olabilir.
- `--no-alt-screen` kullanimi scrollback'i koruyor ama tmux inject semantigini daha da belirsizlestiriyor.

Kök neden:

- GT, Codex TUI'yi shell benzeri line discipline ile suruyor.
- Oysa Codex bir full-screen/interactive editor semantigi tasiyor; newline gondermek "submit" ile birebir esit degil.

Kalici cozum:

- `tmux send-keys` ile "text + Enter" paradigmasi terk edilmeli.
- Codex icin resmi bir injection stratejisi gerekir:
  - Mumkunse native stdin/prompt IPC
  - Olmuyorsa wrapper process + queue file + paste buffer + submit heuristic
- GT icinde provider-specific `InputDriver` soyutlamasi olmali:
  - `send_text()`
  - `submit()`
  - `interrupt()`
  - `is_idle()`

Codex icin onerilen driver:

- Metni tmux paste-buffer ile atomik bas
- Kisa idle/echo dogrulamasi yap
- Sonra ayri `submit()` cagrisi yap
- Gerekirse submit key configurable olsun: `Enter`, `C-j`, `C-m`
- Bu key map provider preset'te tutulmali, custom agent override'inda kaybolmamali

Bu sorun, `nudge-poller` ve hook eksikligiyle ayni katmanda cozulmeli. Aksi halde her cozum yine tmux key timing hack'ine doner.

## Onerilen Mimari

Kalici cozum icin GT tarafinda uc katmanli bir model oneriyorum:

### A. Provider Capability Registry

Her provider icin sabit capability seti:

- `initial_prompt_mode`
- `supports_hooks`
- `supports_resume`
- `session_id_env`
- `requires_poller`
- `input_driver`
- `default_extra_args`

Not:

- `gt config agent set` yalnizca command/extra args override etmeli.
- Capability metadata built-in provider registry'den gelmeli.

### B. Unified Agent Wrapper

Tum interactive ajanlar wrapper altindan acilmali:

- session id uretme/persist
- `gt prime --hook`
- initial prompt inject
- queue drain
- poller entegrasyonu
- stale lock cleanup

Boylece `.gemini/settings.json` gibi provider-spesifik daginik konfigurasyonlar zorunlu olmaktan cikar; opsiyonel optimize ediciye doner.

### C. Input Driver Layer

`gt nudge`, `gt session inject`, `gt handoff`, `gt sling` ayni driver katmanini kullanmali.

Driver secimi:

- Claude: hook + user prompt submit
- Gemini: hook + poller fallback
- Codex: wrapper queue + provider-specific submit driver

## Oncelik Sirasi

1. `codex` custom override'ini kaldir veya `codex-inline` diye yeniden adlandir.
2. Built-in provider capability registry'yi zorunlu kil.
3. Polecat'ler icin de `nudge-poller` supervisor ac.
4. `.runtime/` state'ini repo disina tasi.
5. Codex icin `InputDriver` ekle; `tmux send-keys` fallback'i son care yap.

## Beklenen Sonuc

Bu degisikliklerden sonra:

- `gt sling --agent codex` Codex session'ini prompt ile baslatir.
- Hook/nudge delivery provider fark etmeksizin ayni session modelinden gecer.
- Polecat'ler de witness/refinery gibi queue drain edebilir.
- Worktree degisimlerinde stale pane/session lock tasinmaz.
- Codex TUI'ye mesaj gondermek Enter timing'ine bagli olmaktan cikar.

## Kisa Karar

Sorunlar birbirinden bagimsiz gorunse de tek kok nedene baglaniyor: GT, Codex ve Gemini'yi "komut adi farkli ama ayni tur ajan" gibi ele aliyor, fakat launch, hook, queue ve input semantiklerini ortak bir capability modeline baglamiyor.

Kalici cozum, yeni workaround eklemek degil; GT'de provider capability registry + unified wrapper + input driver mimarisina gecmek.
