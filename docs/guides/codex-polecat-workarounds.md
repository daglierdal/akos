# Codex Polecat Workaround Rehberi

> gt core degistirilemediginde Codex polecatlar icin en iyi workaround'lar.
> Tarih: 5 Nisan 2026

---

## Sorun ve Cozum Ozeti

| # | Sorun | gt Core Fix? | Workaround |
|---|-------|-------------|------------|
| 1 | Codex'e prompt aktarilmiyor | Hayir — gt launcher Codex'e prompt gecirmiyor | tmux send-keys + cift Enter |
| 2 | Nudge-poller polecat'ler icin calismiyor | Hayir — sadece witness/refinery icin | tmux send-keys ile dogrudan inject |
| 3 | Branch izolasyonu | Calisiyor — her polecat kendi branch'inde | gt native (sorun yok) |
| 4 | Custom override metadata dusuruyor | Cozuldu — config.toml'a tasindi | Built-in preset + codex config.toml |
| 5 | Codex TUI cift Enter | Workaround | tmux send-keys text Enter + sleep + Enter |

## Yapisal Duzeltmeler (Uygulandi)

### 1. Custom codex override kaldirildi

**Onceki:** `gt config agent set codex "codex --dangerously-bypass-approvals-and-sandbox --no-alt-screen"`
— Bu, built-in metadata'yi (Resume Style, Supports Hooks, Session ID Env) dusuruyordu.

**Simdi:** Custom override kaldirildi, built-in preset geri geldi:
```
Agent: codex
Type:   built-in
Command: codex
Args:    --dangerously-bypass-approvals-and-sandbox
Resume Style:  subcommand (resume)
Supports Hooks: false
```

### 2. --no-alt-screen Codex config'ine tasindi

`~/.codex/config.toml` icine eklendi:
```toml
no_alt_screen = true
```

Bu sayede:
- gt built-in preset korunuyor (metadata kaybolmuyor)
- Her Codex session otomatik inline modda aciliyor
- tmux capture-pane duzgun calisiyor

### 3. .runtime/ gitignore'da

Onceki fix (6bee648) ile `.runtime/` git index'ten cikarildi ve `.gitignore`'a eklendi.
Stale lock sorunu cozuldu.

### 4. .codex/instructions.md her worktree'de

Codex'in SessionStart hook'u yok, bu yuzden `.codex/instructions.md` GT workflow komutlarini (gt prime, gt hook, gt done) ogretir.

## Devam Eden Workaround'lar

### P1: Codex'e Gorev Aktarimi

gt sling Codex session'a prompt gecirmiyor. Her sling sonrasi manuel inject gerekiyor:

```bash
# 1. Sling et (polecat spawn olur)
gt sling ak-xyz akos --agent codex

# 2. 4 saniye bekle (session acilsin)
sleep 4

# 3. Gorevi tmux ile gonder (tek satirda, sonuna Enter)
tmux send-keys -t ak-<polecat-adi> "Gorev talimati burada..." Enter

# 4. 1 saniye bekle + ikinci Enter (Codex TUI submit)
sleep 1 && tmux send-keys -t ak-<polecat-adi> Enter
```

**Neden cift Enter?** Codex TUI'de ilk Enter metni input editor'e yazar, ikinci Enter submit eder.

**Otomasyon:** Bu adimlari bir bash fonksiyonu ile sarmalayabilirsin:

```bash
# ~/.zshrc veya script'e ekle
codex-sling() {
  local bead=$1 msg=$2
  gt sling $bead akos --agent codex
  local polecat=$(gt polecat list akos --json | python3 -c "
import json,sys
for p in json.load(sys.stdin):
  if p.get('state')=='working': print(p['name']); break
")
  sleep 4
  tmux send-keys -t "ak-$polecat" "$msg" Enter
  sleep 1
  tmux send-keys -t "ak-$polecat" Enter
  echo "Sent to ak-$polecat"
}

# Kullanim:
codex-sling ak-xyz "Gorevi yap ve sonucu docs/output.md'ye yaz"
```

### P2: Nudge Delivery

gt nudge Codex polecat'lere ulasmiyor (poller yok). Workaround:

```bash
# Nudge yerine tmux ile dogrudan mesaj gonder
tmux send-keys -t ak-<polecat-adi> "Ek talimat veya soru" Enter
sleep 1
tmux send-keys -t ak-<polecat-adi> Enter
```

### P3: Branch Izolasyonu — SORUN YOK

gt zaten her polecat icin ayri branch olusturuyor:
```
polecat/enclave-mnm8d6wq
polecat/synth-mnm2abc1
```

Bu calisiyor, workaround gerekmiyor.

## gt Core Degisiklik Onerileri

Bunlar gt'nin kaynak kodunda yapilmasi gereken degisiklikler (homebrew binary — biz yapamiyoruz):

1. **Provider Capability Registry:** Custom agent override built-in metadata'yi ezmemeli. `--provider` flag'i capability'leri korumalı.

2. **Codex Prompt Injection:** `gt sling` / session start Codex icin de positional prompt gecirmeli (`codex <prompt>`).

3. **Universal Nudge-Poller:** `supports_hooks=false` olan tum session'lar icin poller baslatilmali.

4. **Input Driver:** tmux send-keys yerine provider-specific input driver (`paste-buffer + submit`).

## Kontrol Listesi

Yeni Codex polecat spawn etmeden once:

```bash
# 1. Built-in preset aktif mi?
gt config agent get codex | grep "Type"
# "built-in" olmali, "custom" degil

# 2. config.toml'da no_alt_screen var mi?
grep no_alt_screen ~/.codex/config.toml
# no_alt_screen = true olmali

# 3. .runtime/ tracked degil mi?
git --git-dir=$HOME/gt/akos/.repo.git ls-files .runtime/
# Bos donmeli

# 4. .codex/instructions.md var mi?
ls ~/gt/akos/.codex/instructions.md
# Dosya olmali
```
