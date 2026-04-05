# GT Ekosistem Arastirma Notu

Bu not, Steve Yegge'nin uc Medium yazisini, resmi `gastown` ve `beads` GitHub repolarini ve GT/Beads formula sistemindeki TOML orneklerini bir araya getirir.

## Kisa Ozet

- `beads`, ajanlar icin kalici, yapisal bir is/issue grafigi saglayan temel katman.
- `gastown`, `beads` uzerine kurulu cok ajanli orkestrasyon sistemi; roller, hook/worktree, mail, convoy ve watchdog mantigini ekliyor.
- Steve Yegge'nin Medium yazilarinda cizilen vizyon, repolardaki mevcut mimariyle buyuk olcude uyumlu: "tek super ajan" yerine "fabrika gibi calisan cok ajanli sistem".
- "Formul" adiyla ayri bir resmi modulu/reposunu bu kaynaklarda bulamadim. Bu ekosistemde karsima cikan resmi yapi `formula` / `.formula.toml` sistemi oldu.

## 1. Medium Yazilari: Ana Fikirler

### 1.1 Welcome to Gas Town

Launch yazisi Gas Town'i bir "multi-agent coding factory" olarak konumluyor. Ana vurgu, ajanlarin tek tek daha zeki olmasindan cok, koordineli sekilde daha fazla ajan calistirabilmek. Bu da repo tarafinda su parcalarla eslesiyor:

- `Mayor`: merkezi koordinasyon
- `Polecats`: is yapan worker ajanlar
- `Witness`, `Deacon`, `Dogs`: denetim ve recovery
- `Refinery`: merge queue / verification / entegrasyon kati
- `Beads`: kalici is durumu ve bagimlilik grafigi

Bu yazi, GT'nin ana iddiasini kuruyor: agent memory'yi prompt icinde degil, dissal ve yapisal bir sistemde tutmak.

### 1.2 The Future of Coding Agents

Bu yazida Yegge, Gas Town'in henuz "sloppy ama calisan" bir ilk versiyon oldugunu, fakat 2026 boyunca dort sebeple guclenecegini savunuyor:

1. Modeller daha iyi olacak.
2. Gas Town ve Beads modellerin egitim/veri evrenine girecek.
3. Agent saglayicilari factory-worker tarzinda otomasyona daha uygun API'ler sunacak.
4. Topluluk urunu hizla ilerletecek.

Yazidaki en onemli teknik ayrim su:

- Bircok arac "daha iyi ajan" yapmaya odakli.
- Gas Town ise "daha fazla ajan" ve "ajanlari fabrika duzeninde calistirma" problemine odakli.

Bu ayrim, repo icinde de goruluyor. `gastown`'da Go kodu daha cok tasima/altyapi katmani olarak konumlanmis; karar verme mantiginin buyuk kismi formula/role instruction tarafina itilmis.

### 1.3 AI Vampire

Bu yazi daha az teknik, daha cok kultur ve ekonomi odakli; ama GT ekosistemi icin kritik bir arka plan veriyor. Ana tez:

- AI-native yazilim gelistirme asiri hiz ve asiri calisma baskisi uretiyor.
- Sirketler AI verimliligini tamamiyle kendine capture etmeye calisirsa burnout ve extraction kacınılmaz oluyor.
- "Build is the New Buy" mantigi, custom ic araclari ve ajan fabrikalari lehine calisabilir.

GT baglaminda bunun anlami:

- Gas Town sadece teknik bir arac degil; "icerde kurulan agent factory" modelinin araci.
- Yegge'nin SaaS supheciligi, GT ve Beads'in acik kaynak ve kendi ortamina kurulabilen araclar olmasiyla tutarli.

## 2. GitHub Reposu Analizi

## 2.1 `gastown`: orkestrasyon ve rol sistemi

Repo: <https://github.com/gastownhall/gastown>

`README.md`'de Gas Town kendini "multi-agent orchestration system" olarak tanimliyor. Buradaki cekirdek fikirler:

- tek proje yerine "town" / "rig" / "crew" / "polecat" gibi hiyerarsi
- ephemeral session + persistent identity
- git worktree tabanli kalicilik
- Beads ledger uzerinde is takibi
- convoy ve molecule/formula tabanli workflow

One cikan mimari unsurlar:

- `Mayor`: merkezi AI coordinator
- `Rigs`: proje konteynerleri
- `Polecats`: task-level worker ajanlar
- `Hooks`: worktree tabanli persistent state
- `Convoys`: birlikte takip edilen is paketleri
- `Witness` / `Deacon` / `Dogs`: operasyonel saglik zinciri
- `Refinery`: verification + merge queue

Pratik yorum:

- `gastown`, agent runtime'dan bagimsiz bir isletim sistemi olmaya calisiyor.
- Runtime tarafinda Claude, Codex, Copilot, Gemini vb. destekleniyor; yani deger modeli "bir modele kilitli olmak" degil.
- Sistem, prompt chaining yerine kalici is durumu + rol ayrimi + formula tanimi ile olceklendiriliyor.

## 2.2 `beads`: kalici is ve bagimlilik grafigi

Repo: <https://github.com/gastownhall/beads>

`beads`, README'ye gore "distributed graph issue tracker for AI agents". Bu repo GT'nin temel veri modeli gibi calisiyor.

One cikan ozellikler:

- Dolt tabanli version-controlled SQL storage
- dependency-aware task graph
- claim / close / ready / blocked akisi
- hierarchy ve molecule kavramlari
- mesajlasma / threading
- ajan dostu JSON ciktilar

Pratik yorum:

- `gastown` olmadan da `beads` tek basina ajan is takibi icin kullanilabiliyor.
- `gastown`, `beads` in ustune operasyon, ajan yasam dongusu ve merge/refinery katmanini ekliyor.
- Bu iki repo birlikte dusunuldugunde su ayrim net:
  - `beads` = state + graph + workflow substrate
  - `gastown` = orchestration + runtime + supervision

## 2.3 Repolar arasi iliski

Inceledigim kaynaklara gore en saglikli mental model su:

- `beads`, "issue graph + workflow memory" altyapisi
- `gastown`, bu altyapiyi kullanarak "agent town/factory" kuruyor

`gastown/README.md` icindeki "Work state stored in Beads ledger" ifadesi bu bagliligi acik gostermis. `beads/docs/MOLECULES.md` ise workflow semantics'in esasinin zaten Beads tarafinda tanimlandigini gosteriyor.

Yani GT'nin workflow mantigi sifirdan ayrik bir DSL degil; Beads'in epic/dependency/molecule modelini operasyonel hale getiren bir ust katman.

## 3. Formula ve TOML Sistemi

## 3.1 "Formul" ne olabilir?

Arastirma boyunca:

- `gastown` icinde ayri bir `Formul` modulu bulamadim.
- `beads` icinde de ayri bir `Formul` repo/urun referansi bulamadim.
- Resmi ve yaygin kullanim `formula` ve `.formula.toml` dosyalari.

Bu nedenle "Formul TOML ornekleri" istegini, GT/Beads ekosistemindeki `.formula.toml` ornekleri olarak yorumladim.

## 3.2 Beads tarafinda TOML destegi

`beads/CHANGELOG.md` TOML support'un formula sistemi icin eklendigini acikca soyluyor:

- `.formula.toml` dosyalari JSON formatina alternatif olarak destekleniyor
- insan dostu authoring secenegi olarak tanitiliyor

Onemli nokta:

- `beads` repo icinde su an cok sayida canli `.formula.toml` ornegi yok
- gercek ve zengin TOML formula ornekleri `gastown` repo icinde bulunuyor

Bu da mantikli; cunku GT bu formula mekanizmasini daha yogun kullanan orchestration kati.

## 3.3 Formula yapisinin ortak semasi

`gastown` altindaki formula dosyalarina bakinca ortak bir iskelet cikiyor:

```toml
formula = "ornek-formul"
type = "workflow"
version = 1

[vars.some_var]
description = "..."
required = true

[[steps]]
id = "step-a"
title = "Step A"
description = "..."

[[steps]]
id = "step-b"
needs = ["step-a"]
description = "..."
```

Buradaki temel kavramlar:

- `formula`: formula kimligi
- `type`: workflow tipi
- `version`: schema/recipe versiyonu
- `[vars.*]`: parametre tanimlari
- `[[steps]]`: adimlar
- `needs`: dependency zinciri
- `pour = true` gibi alanlarla persistent mol davranisi kontrol edilebiliyor

## 3.4 Buldugum somut TOML ornekleri

### Ornek 1: `agent-validation.formula.toml`

Kaynak:
<https://github.com/gastownhall/gastown/blob/main/docs/examples/agent-validation.formula.toml>

Bu dosya, bir polecat ajaninin kendi GT entegrasyonunu dogrulamak icin kullanilan gercek bir workflow. Dikkat ceken kisimlar:

- uzun ve operasyonel `description`
- `type = "workflow"`
- `[vars.task]` gibi degisken deklarasyonlari
- `verify-context`, `verify-lifecycle`, `verify-hook`, `verify-tools` gibi adimlar
- `needs` ile sirali ilerleyis

Bu ornek, formula sisteminin sadece build pipeline degil, agent bootstrapping ve self-validation icin de kullanildigini gosteriyor.

### Ornek 2: `beads-release.formula.toml`

Kaynak:
<https://github.com/gastownhall/gastown/blob/main/internal/formula/formulas/beads-release.formula.toml>

Bu dosya release workflow icin guclu bir ornek:

- `pour = true` ile kalici izlenebilir instance davranisi
- `[vars.version]` ile release parametresi
- `preflight-git`, `preflight-pull`, `review-changes`, `update-changelog`, `run-bump-script`, `wait-ci` gibi adimlar
- GitHub Actions, npm, PyPI, version consistency ve local install gibi release operasyonlarini ayni workflow altinda topluyor

Bu, formula sisteminin yalniz task checklist'i degil, gercek release choreography icin kullanildigini gosteriyor.

### Ornek 3: `mol-polecat-work.formula.toml`

Kaynak:
<https://github.com/gastownhall/gastown/blob/main/internal/formula/formulas/mol-polecat-work.formula.toml>

Bu dosya bence ekosistemin en kritik orneklerinden biri. Cunku burada asil "agent contract" var:

- agent context yukleme
- hook ve bead dogrulama
- branch setup
- implementasyon
- state'i bead'e persist etme
- test/verify/rebase davranisi
- `gt done` ile self-cleaning lifecycle

Yani bu formula, GT'nin polecat worker'lari icin fiili SOP'si gibi calisiyor.

## 3.5 Formula resolution ve katmanlar

Kaynak:
<https://github.com/gastownhall/gastown/blob/main/docs/design/formula-resolution.md>

Bu dokuman, formula cozumleme sirasini netlestiriyor:

1. project-level: `<project>/.beads/formulas/`
2. town-level: `~/gt/.beads/formulas/`
3. system-level: binary icine embed edilmis formulalar

Bu tasarim onemli cunku:

- proje bazli override'a izin veriyor
- town genelinde ortak custom workflow sunuyor
- sistem default'larini fallback olarak koruyor

Bu, enterprise veya ekip ortami icin oldukca guclu bir model. Herkesin ayni "agent workflow contract"i kullanmasi saglanabiliyor.

## 4. Ekosistem Icgorusleri

## 4.1 GT'nin asil yeniligi "role + state + workflow" kombinasyonu

Burada yenilik sadece "cok ajan acmak" degil. Uc katman birlikte geliyor:

- `beads`: yapisal ve kalici state
- `formula`: tekrarlanabilir workflow DSL'i
- `gastown`: rol bazli operasyon ve recovery

Bu ucunun birlikte calismasi, GT'yi basit bir tmux + script yiginindan ayiriyor.

## 4.2 Go tarafi "transport", cognition tarafi formula/agent

`gastown/CONTRIBUTING.md` ozellikle sunu savunuyor:

- Go kodu plumbing/transport yapmali
- reasoning ve judgment agent/formula tarafinda kalmali
- "detect X and do Y" ise yeni subcommand yerine formula adimi dusunulmeli

Bu, yazidaki "factory" tezini dogrudan destekliyor. Sistem sabit heuristic'lerle degil, giderek daha iyi olacak modellerle yasamak uzere tasarlaniyor.

## 4.3 Beads tek basina urun, Gastown ise multiplier

Mevcut tabloya gore:

- `beads` tek basina kullanilabilecek, daha genel amacli altyapi
- `gastown` ise onu AI-native operasyon modeline ceviren carpani

Bu da adoption acisindan mantikli:

- once `bd` ile task graph ve persistent memory
- sonra gerekirse `gt` ile orchestration, patrol, convoy, refinery

## 4.4 "Build is the New Buy" ile teknik mimari arasinda tutarlilik var

`AI Vampire` yazisindaki "Build is the New Buy" tezi ile repolarin yapisi tutarli:

- acik kaynak
- local/self-hosted vari kullanimlar
- runtime/provider agnostic yaklasim
- rigid SaaS workflow yerine config + formula + repo icinde yasayan automation

Bu ekosistem, sirketlerin kendi ic agent factory'lerini kurmasi fikrine hizmet ediyor.

## 5. Sonuc

Bu arastirma sonunda bence GT ekosistemi su sekilde ozetlenebilir:

- `beads`, ajanlar icin kalici issue/dependency hafizasi saglayan temel motor.
- `gastown`, bu motorun ustunde calisan cok ajanli bir operasyon sistemi.
- `formula` / `.formula.toml` yapisi, bu ekosistemin tekrar kullanilabilir workflow DSL'i.
- Steve Yegge'nin Medium yazilarindaki vizyon, repo gercegiyle buyuk olcude hizali: agentleri tek tek "super zeki" yapmaktan cok, kalici state ve operasyonel rollerle "calisan bir fabrika" kurmak.

En net teknik bulgu:

- "Formul" diye ayri bir urun bulamadim.
- Ama GT/Beads formula sistemi icinde guclu ve gercek `.formula.toml` ornekleri var.
- Bu orneklerin en zenginleri `gastown` repo icinde.

## Kaynaklar

### Medium

- Steve Yegge, "Welcome to Gas Town"  
  <https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04>
- Steve Yegge, "The Future of Coding Agents"  
  <https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c>
- Steve Yegge, "The AI Vampire"  
  <https://steve-yegge.medium.com/the-ai-vampire-eda6e4f07163>

### GitHub

- gastown repo  
  <https://github.com/gastownhall/gastown>
- beads repo  
  <https://github.com/gastownhall/beads>
- agent validation formula  
  <https://github.com/gastownhall/gastown/blob/main/docs/examples/agent-validation.formula.toml>
- beads release formula  
  <https://github.com/gastownhall/gastown/blob/main/internal/formula/formulas/beads-release.formula.toml>
- polecat work formula  
  <https://github.com/gastownhall/gastown/blob/main/internal/formula/formulas/mol-polecat-work.formula.toml>
- formula resolution design  
  <https://github.com/gastownhall/gastown/blob/main/docs/design/formula-resolution.md>
- Beads molecules doc  
  <https://github.com/gastownhall/beads/blob/main/docs/MOLECULES.md>
