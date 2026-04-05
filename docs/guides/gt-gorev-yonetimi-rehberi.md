# Gas Town Gorev Yonetimi Rehberi

> AkOs rigi icin gt ve bd komutlarinin pratik kullanim kilavuzu.
> Tarih: 5 Nisan 2026

---

## 1. Beads (bd) — Is Takip Sistemi

Beads, Gas Town'un hafif issue tracker'idir. Her is birimi bir "bead"dir.

### 1.1 Bead Olusturma

```bash
# Basit
bd create "Tenant tablosu olustur"

# Detayli
bd create "Tenant tablosu olustur" \
  -d "tenants tablosu, FK'lar, RLS policy'leri ekle" \
  -p 1 \
  -t task \
  -l "faz0,supabase,migration" \
  --assignee "raider"

# Hizli (sadece ID doner — scripting icin)
bd q "Hizli fix: typo duzelt"
```

**En iyi format:**
- **Baslik:** Fiil ile basla, kisa tut: "Tenant tablosu olustur", "Tool registry tekilestir"
- **Aciklama (-d):** Ne yapilacak, neden, kabul kriteri. 2-3 cumle yeterli.
- **Oncelik (-p):** 0=Kritik, 1=Yuksek, 2=Orta (varsayilan), 3=Dusuk, 4=Backlog
- **Tip (-t):** task (varsayilan), bug, feature, epic, chore, decision
- **Etiket (-l):** Virgul ayirmali. Ornek: faz0,supabase,auth
- **Bagimllik (--deps):** Siralama gerektiginde: `--deps "blocks:ak-xyz"`

### 1.2 Bead Listeleme ve Sorgulama

```bash
bd list                          # Acik beadler (son 50)
bd list --all                    # Acik + kapali
bd list -l faz0                  # Etiketle filtrele
bd list -p 1                     # Sadece yuksek oncelik
bd list --ready                  # Engeli olmayan, hazir isler
bd list --assignee raider        # Atanmis isler
bd list --overdue                # Gecmis tarihliler

bd query "status=open AND label=faz0 AND priority<=1"
bd search "tenant"               # Metin arama
bd ready                         # Hazir isler (blokeri yok)
```

### 1.3 Bead Guncelleme

```bash
bd show ak-xyz                   # Detay gor
bd close ak-xyz -r "Tamamlandi"  # Kapat
bd reopen ak-xyz                 # Tekrar ac
bd priority ak-xyz 0             # Oncelik degistir
bd assign ak-xyz vault           # Ata
bd tag ak-xyz urgent             # Etiket ekle
bd note ak-xyz "Review bekleniyor"  # Not ekle
bd comment ak-xyz "Merge edildi"    # Yorum ekle
```

### 1.4 Bagimliliklar

```bash
bd dep ak-abc --blocks ak-xyz    # abc, xyz'i engelliyor
bd dep list ak-xyz               # Bagimliliklari listele
bd dep tree ak-xyz               # Agac gorunumu
bd dep cycles                    # Dongu tespit
bd graph ak-xyz                  # Gorsel DAG
```

---

## 2. Convoy — Toplu Is Takibi

Convoy, birbiriyle iliskili birden fazla bead'i bir arada izler. "Is paketi" gibi dusun.

### 2.1 Ne Zaman Kullanilir?

- Paralel 3 polecat'e is dagitiyorsan → convoy
- Siralanmis adimlar varsa (P1 → P2 → P3) → convoy + bagimlilik
- Tek bead, tek polecat → convoy gereksiz (`gt sling` otomatik olusturur)

### 2.2 Convoy Olusturma

```bash
# Basit: 3 bead'i takip et
gt convoy create "Faz 0 Revizyonu" ak-dwq ak-yxi ak-8jy

# Sahibi ve bildirim
gt convoy create "Faz 0 Rev" ak-dwq ak-yxi --owner mayor/ --notify overseer

# Merge stratejisi
gt convoy create "Release" ak-abc --merge=direct    # Dogrudan main'e
gt convoy create "Feature" ak-abc --merge=mr         # Merge queue (varsayilan)
gt convoy create "Review" ak-abc --merge=local       # Branch'te kal
```

### 2.3 Convoy Yonetimi

```bash
gt convoy list                   # Acik convoy'lar
gt convoy list --tree            # Agac gorunumu
gt convoy status hq-cv-abc       # Detayli durum
gt convoy add hq-cv-abc ak-new   # Yeni bead ekle
gt convoy close hq-cv-abc        # Manuel kapat
gt convoy check                  # Tamamlananlari otomatik kapat
```

### 2.4 Staged Convoy (Dalgali Dagitim)

Bagimlilik zinciri olan buyuk isler icin:

```bash
# Dalga analizi yap
gt convoy stage ak-epic-xyz

# Analiz et ve hemen baslat
gt convoy stage ak-epic-xyz --launch

# Hazir convoy'u baslat
gt convoy launch hq-cv-staged
```

---

## 3. Sling — Is Dagitma

`gt sling` Gas Town'un ana is dagitim komutudur. Bead'i hedef agent'a atar, gerekirse polecat spawn eder, formula uygular.

### 3.1 Temel Kullanim

```bash
# Polecat'e at (rig'de otomatik spawn)
gt sling ak-xyz akos

# Belirli agent ile
gt sling ak-xyz akos --agent codex
gt sling ak-xyz akos --agent gemini

# Mayor'a at
gt sling ak-xyz mayor

# Crew member'a at
gt sling ak-xyz akos --crew mel

# Mesajla birlikte
gt sling ak-xyz akos -m "Sadece migration yaz, UI dokunma"
```

### 3.2 Sling ve Bead Iliskisi

Sling her zaman bir bead uzerinden calisir. Akis:

```
bd create "Gorev" → ak-xyz olusur
gt sling ak-xyz akos → polecat spawn, hook'a takilir, formula uygulanir
polecat calisir → gt done → merge queue
```

**Otomatik convoy:** Tek bead sling ettiginde `gt sling` otomatik bir convoy olusturur (istemiyorsan `--no-convoy`).

### 3.3 Coklu Sling

```bash
# 3 bead'i ayni rig'e (3 polecat spawn olur)
gt sling ak-abc ak-def ak-ghi akos

# Eslesmeli sinir
gt sling ak-abc ak-def akos --max-concurrent 2
```

### 3.4 Formula ile Sling

```bash
# Hazir formula uygula
gt sling mol-polecat-work akos

# Formula'yi mevcut bead'e uygula
gt sling shiny --on ak-xyz akos

# Degiskenlerle
gt sling towers-of-hanoi --var disks=3 akos
```

### 3.5 Sling vs Hook vs Handoff

| Komut | Ne yapar |
|-------|----------|
| `gt hook ak-xyz` | Sadece takar, eylem yok |
| `gt sling ak-xyz` | Takar + hemen baslar (context korunur) |
| `gt handoff ak-xyz` | Takar + session yeniden baslar (temiz context) |

---

## 4. Formula — Yeniden Kullanilabilir Is Akislari

Formula'lar TOML dosyalaridir. Adim adim is akisi tanimlar.

### 4.1 Formula Turleri

| Tur | Kullanim |
|-----|----------|
| **workflow** | Cok adimli, bagimlilik zincirli (ornek: mol-polecat-work) |
| **task** | Tek adimli basit gorev |
| **patrol** | Tekrarlayan dongu (ornek: mol-witness-patrol) |
| **expansion** | Mevcut formula'ya eklenen kural (ornek: rule-of-five) |
| **aspect** | Capraz kesisen ilgi alani (ornek: security-audit) |
| **convoy** | Paralel alt-gorevler (ornek: code-review) |

### 4.2 Varsayilan Polecat Formula'si: mol-polecat-work

Her polecat sling edildiginde otomatik uygulanir. 8 adim:

```
1. load-context     → gt prime, hook oku
2. branch-setup     → git branch olustur
3. implement        → Gorevi yap
4. commit-changes   → git add, commit
5. self-review      → Kendi kodunu incele
6. build-check      → npm test, tsc, build
7. pre-verify       → Rebase, conflict kontrolu
8. submit-and-exit  → gt done (merge queue + cikis)
```

### 4.3 Adim 0 Gibi Gorevler Icin Uygun Formulalar

| Formula | Kullanim | Neden |
|---------|----------|-------|
| `mol-polecat-work` | Her polecat gorevi | Varsayilan, 8 adimli yasam dongusu |
| `shiny` | Tasarim gerektiren gorev | Kod yazmadan once tasarim adimlari |
| `shiny-enterprise` | Buyuk gorev | Rule of Five + tasarim |
| `code-review` | Kod inceleme | Paralel uzman reviewerlar |
| `mol-polecat-code-review` | PR review | Tek polecat review |
| `mol-idea-to-plan` | Belirsiz gorev | Fikir → plan pipeline'i |

Adim 0 icin `mol-polecat-work` yeterli — zaten otomatik uygulanir.

### 4.4 Custom Formula Olusturma

```bash
# Task formula
gt formula create my-task

# Workflow formula
gt formula create my-workflow --type=workflow

# Patrol formula
gt formula create nightly-check --type=patrol
```

Dosya `.beads/formulas/my-task.formula.toml` olarak olusur.

### 4.5 Formula Arama Yollari

1. `.beads/formulas/` (proje seviyesi)
2. `~/.beads/formulas/` (kullanici seviyesi)
3. `$GT_ROOT/.beads/formulas/` (town seviyesi — 47 hazir formula burada)

---

## 5. Molecule (mol) — Calisan Is Akisi

Formula bir sablon, molecule ise o sablonun calistirilan bir ornegi.

```bash
gt mol status              # Hook'ta ne var?
gt mol current             # Simdi ne yapmam lazim?
gt mol progress            # Ilerleme durumu
gt mol step done           # Mevcut adimi tamamla
gt mol dag                 # Bagimlilik gorsellesir
```

---

## 6. Directive — Rol Bazli Talimatlar

Formula'nin "nasil yap" demesine karsilik, directive "ne zaman ne yap" der.

```bash
gt directive list                  # Tum directive'ler
gt directive show polecat          # Polecat talimatlarini gor
gt directive edit polecat          # Duzenle
gt directive show mayor --rig akos # Rig-spesifik
```

**Dosya yapisi:**
- Town-level: `~/gt/directives/mayor.md`
- Rig-level: `~/gt/akos/directives/polecat.md`

Cozumleme: Town + Rig birlestrilir, rig son sozu soyler.

---

## 7. En Verimli Gorev Verme Akislari

### Tek Gorev, Tek Polecat

```bash
# En hizli yol — direkt sling
bd create "Gorev aciklamasi" && gt sling <bead-id> akos --agent codex -m "Detayli talimat"
```

Convoy otomatik olusur, formula otomatik uygulanir.

### Paralel Gorevler (Adim 0 Gibi)

```bash
# 1. Bead'leri olustur
bd create "P1: Tenant" -l faz0,auth
bd create "P2: Tool registry" -l faz0,ai
bd create "P3: Chat kaliciligi" -l faz0,chat

# 2. Paralel sling
gt sling ak-p1 ak-p2 ak-p3 akos --agent codex

# Veya tek tek (daha fazla kontrol)
gt sling ak-p1 akos --agent codex -m "Tenant gorevi..."
gt sling ak-p2 akos --agent codex -m "Tool gorevi..."
gt sling ak-p3 akos --agent codex -m "Chat gorevi..."

# 3. Takip
gt convoy list --tree
```

### Siralanmis Gorevler (Bagimli)

```bash
# Bead'leri bagimlilikla olustur
bd create "P1: Schema" -l faz0
bd create "P2: API" -l faz0 --deps "blocks:ak-p1"
bd create "P3: UI" -l faz0 --deps "blocks:ak-p2"

# Staged convoy ile dalga dagitimi
gt convoy stage --from-epic ak-epic --launch
```

### Buyuk Proje (Epic)

```bash
# Epic olustur
bd create "Faz 1 Dokuman Yonetimi" -t epic

# Alt gorevleri bagla
bd create "Upload UI" --parent ak-epic
bd create "Storage layer" --parent ak-epic
bd create "Parse pipeline" --parent ak-epic --deps "blocks:ak-storage"

# Tum alt gorevleri sling
gt convoy stage ak-epic --launch
```

---

## 8. Codex Polecat Icin Ozel Notlar

Codex polecat'ler Claude'dan farkli calisir:

| Ozellik | Claude | Codex |
|---------|--------|-------|
| SessionStart hook | Var | Yok |
| Prompt aktarimi | Positional arg | Manuel tmux send-keys |
| Nudge | gt nudge calisir | Nudge-poller yok, tmux gerekir |
| Context | gt prime otomatik | .codex/instructions.md gerekir |
| Submit | Tek Enter | Cift Enter (TUI) |

**Workaround:** Sling sonrasi her Codex polecat'e:
```bash
sleep 4 && tmux send-keys -t ak-<name> "Gorev talimati..." Enter
sleep 2 && tmux send-keys -t ak-<name> Enter  # Submit
```

---

## 9. Hizli Referans

```bash
# Bead yasam dongusu
bd create → bd show → bd assign → bd close

# Is dagitimi
bd create → gt sling → (polecat calisir) → gt done

# Takip
gt convoy list --tree
gt polecat list akos
bd list --ready

# Temizlik
gt polecat nuke akos/name --force
gt convoy check
bd stale
```
