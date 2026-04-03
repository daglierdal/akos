# Antigravity

Antigravity, Gas Town ekosisteminin planlama ve görev yönetimi katmanıdır. İnsan
kullanıcının (Manager) otonom yazılım ajanlarına (Polecats) iş tanımlama, dağıtma
ve izleme sürecini yönetir. Adını, geleneksel yazılım geliştirmedeki "yerçekimi"ni
— manuel koordinasyon, bağlam kaybı, iletişim yükü — tersine çevirmesinden alır.

## Mimari

Antigravity, üç katmanlı bir mimariye sahiptir:

```
┌─────────────────────────────────────────────────┐
│  MacBook (Developer)                            │
│  ┌───────────────────────────────────────────┐  │
│  │  Manager View                             │  │
│  │  - Görev tanımı ve planlama               │  │
│  │  - gt mayor attach / gt convoy list       │  │
│  └──────────────────┬────────────────────────┘  │
│                     │ SSH                        │
└─────────────────────┼───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│  Mac Mini (Gas Town Host)                       │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Mayor   │  │  Witness │  │  Refinery    │  │
│  │ (coord.) │  │ (monitor)│  │ (merge queue)│  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │          │
│  ┌────▼──────────────▼───────────────▼───────┐  │
│  │  Beads (Dolt DB — port 3307)              │  │
│  │  İssue tracking, mail, iş geçmişi        │  │
│  └────┬──────────────────────────────────────┘  │
│       │                                         │
│  ┌────▼──────────────────────────────────────┐  │
│  │  Polecats (Otonom İşçiler)                │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│  │  │  rust   │  │ furiosa │  │  ...    │   │  │
│  │  │ (worktree) │ (worktree) │          │   │  │
│  │  └─────────┘  └─────────┘  └─────────┘   │  │
│  │  Editor View — her biri kendi git         │  │
│  │  worktree'sinde bağımsız çalışır          │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Bileşenler

| Bileşen | Konum | Görev |
|---------|-------|-------|
| **Mayor** | `~/gt/mayor/` | Görev koordinasyonu, polecat ataması, sistem yönetimi |
| **Witness** | `~/gt/<rig>/witness/` | Polecat sağlık izleme, takılma tespiti, escalation |
| **Refinery** | `~/gt/<rig>/refinery/` | Merge queue, test çalıştırma, main'e merge |
| **Polecats** | `~/gt/<rig>/polecats/<isim>/` | Otonom kod geliştirme, her biri izole worktree |
| **Beads** | Dolt DB (port 3307) | İssue tracking, mail, formülalar, iş geçmişi |
| **Deacon** | `~/gt/deacon/` | Sistem bakımı, daemon yönetimi |

### Veri Akışı

```
1. Manager görev tanımlar (bd create / Mayor'a sözel talimat)
         │
2. Mayor, formüla ekler ve polecat'e atar (hook mekanizması)
         │
3. Polecat, hook'undaki işi alır (gt hook)
         │
4. Polecat, formüla adımlarını izleyerek çalışır
         │
5. Polecat, gt done ile submit eder → MR merge queue'ya girer
         │
6. Refinery testleri çalıştırır, main'e merge eder
         │
7. Witness, tüm süreci izler ve sorunları escalate eder
```

## Manager View

Manager View, insan kullanıcının Antigravity ile etkileşim kurduğu katmandır.
MacBook üzerinden SSH ile Mac Mini'ye bağlanarak çalışır.

### Ne Yapabilirsiniz

**Görev Tanımı**: Açık, ölçülebilir görevler oluşturma ve polecat'lere atama.

```bash
# Mayor session'ına bağlan
gt mayor attach

# Doğal dilde görev ver
# "docs/antigravity.md oluştur — kapsamlı, Türkçe, markdown formatında"
# Mayor bunu beads'e kaydeder ve uygun polecat'e atar
```

**İzleme**: Aktif görevleri ve polecat durumlarını takip etme.

```bash
gt convoy list                    # Tüm aktif görevleri listele
gt convoy status <convoy-id>      # Belirli görevin detayını gör
gt status                         # Genel sistem durumu
gt doctor                         # Sağlık kontrolü
```

**İletişim**: Çalışan ajanlarla iletişim.

```bash
gt nudge akos/polecats/rust "Durumun nedir?"   # Anlık mesaj (bedava)
gt mail send akos/witness -s "Konu" -m "Mesaj"  # Kalıcı mesaj (Dolt commit)
```

### İyi Görev Tanımı Kuralları

Etkili görevler şu özelliklere sahiptir:

| Özellik | Doğru | Yanlış |
|---------|-------|--------|
| **Net** | "primes.py: asal sayı bulucu yaz ve test et" | "Sistemi iyileştir" |
| **Bağımsız** | Polecat tek başına tamamlayabilir | Başka bir polecat'in çıktısına bağımlı |
| **Küçük kapsam** | Tek özellik veya tek fix | "Tüm projeyi refactor et" |
| **Doğru repo** | Hedef repo'da çalışılabilir | Yanlış repo'yu hedefler |

### Manager View İş Akışı

```
1. SSH ile Mac Mini'ye bağlan
2. gt mayor attach (Mayor session'ına gir)
3. Görevi doğal dilde anlat
4. Mayor otomatik olarak:
   - Beads'e issue kaydeder
   - Formüla ekler (mol-polecat-work)
   - Uygun polecat'e atar (hook mekanizması)
5. gt convoy list ile takip et
6. Polecat çalışır → gt done → Refinery merge eder
```

## Editor View

Editor View, polecat'lerin (otonom işçi ajanların) çalışma perspektifidir. Her
polecat kendi git worktree'sinde izole olarak çalışır ve 8 adımlı bir formüla
sürecini takip eder.

### Polecat Çalışma Ortamı

Her polecat'in kendine ait:
- **Git worktree**: `~/gt/<rig>/polecats/<isim>/<repo>/` — izole çalışma alanı
- **Branch**: `polecat/<isim>-<id>` — kendi feature branch'i
- **Hook**: Atanan görev ve formüla — `gt hook` ile kontrol edilir
- **Mail adresi**: `<rig>/polecats/<isim>` — iletişim için

### Formüla: 8 Adımlı İş Akışı (mol-polecat-work)

```
Step 1: Load context          → Görev ve ortamı anla
Step 2: Set up branch         → Temiz feature branch oluştur
Step 3: Implement             → Asıl işi yap (kod/doküman)
Step 4: Commit                → Tüm değişiklikleri commit et
Step 5: Self-review           → Kendi kodunu gözden geçir
Step 6: Build check           → Derleme ve temel testler
Step 7: Pre-merge rebase      → Main üzerine rebase + gate çalıştır
Step 8: Submit (gt done)      → Merge queue'ya gönder ve çık
```

### Polecat Temel Komutları

```bash
# Görev kontrolü
gt hook                           # Atanan görevini gör
gt prime                          # Formülü ve tüm adımları göster
bd show <issue-id>                # Görev detaylarını oku

# Geliştirme
git status                        # Çalışma durumu
git add <dosyalar>                # Stage
git commit -m "feat: açıklama (issue-id)"  # Commit

# Bulguları kaydet (session ölürse kaybolmaz)
bd update <issue-id> --notes "Bulgular: ..."
bd update <issue-id> --design "Yapısal analiz: ..."

# Tamamlama
gt done --pre-verified --target main    # Submit ve çık
```

### Polecat Kuralları

- **Tek görev**: Yalnızca hook'taki işle ilgilen
- **Kapsam sözleşmesi**: Bead açıklamasının dışına çıkma
- **Doğrudan main'e push yok**: `gt done` merge queue'yu kullanır
- **Keşfedilen işi dosyala**: `bd create --title="Buldum: ..." --type=bug`
- **15 dakikadan fazla takılma**: Witness'e escalate et

## Gas Town ile Entegrasyon

### Sistem Topolojisi

Gas Town, `~/gt/` dizininde yaşayan çok-ajanlı bir workspace yöneticisidir:

```
~/gt/                              (Town root)
├── mayor/                         (Koordinatör — görev dağıtımı)
├── deacon/                        (Bakım — daemon yönetimi)
├── .beads/                        (HQ-level issue DB)
├── .dolt-data/                    (Dolt server verisi — port 3307)
│
├── akos/                          (Rig: akos)
│   ├── .beads/                    (Rig-level issue DB)
│   ├── .repo.git/                 (Bare git repo)
│   ├── witness/                   (Sağlık izleme)
│   ├── refinery/                  (Merge queue + test)
│   └── polecats/
│       ├── rust/akos/             (Polecat worktree)
│       └── furiosa/akos/          (Polecat worktree)
│
└── test/                          (Rig: test)
    ├── .beads/
    ├── witness/
    ├── refinery/
    └── polecats/
```

### Rig Kavramı

Bir **rig**, tek bir Git reposuna bağlı çalışma birimidir. Her rig'in:
- Kendi beads veritabanı (issue prefix ile ayrılır)
- Kendi witness'i (polecat sağlık izleme)
- Kendi refinery'si (merge queue)
- Bir veya daha fazla polecat'i vardır

Rig yapılandırması `rigs.json`'da tanımlanır:

```json
{
  "akos": {
    "git_url": "git@github.com:daglierdal/akos.git",
    "beads": { "prefix": "ak" }
  }
}
```

### Beads: İş Takip Sistemi

Beads, Dolt (git-for-data) üzerinde çalışan dağıtık issue tracking sistemidir:

```bash
# Issue oluşturma
bd create --title="Yeni özellik" --type=feature --priority=1

# Issue okuma
bd show <id>                      # Detay
bd list --status=open             # Açık issue'lar
bd ready                          # Blocker'sız, çalışılabilir issue'lar

# Issue güncelleme
bd update <id> --status=in_progress
bd update <id> --notes "İlerleme notu"
bd close <id>                     # Tamamlandı

# Prefix routing
bd show ak-xyz                    # → akos beads
bd show hq-abc                    # → town (HQ) beads
```

**Dolt bağlantısı**: Port 3307'de çalışır. `gt dolt status` ile sağlık kontrol
edilir. Sorun varsa `gt escalate -s HIGH "Dolt: <belirti>"` ile escalate edilir.

### İletişim Kanalları

| Yöntem | Maliyet | Kullanım |
|--------|---------|----------|
| `gt nudge` | Sıfır (ephemeral) | Günlük iletişim, durum sorma |
| `gt mail send` | 1 Dolt commit (kalıcı) | Escalation, handoff, HELP mesajları |
| `gt escalate` | 1 Dolt commit | Blocker raporlama |

## Temel Komutlar ve İş Akışı

### Manager (İnsan) Komutları

```bash
# Sisteme bağlanma
ssh <user>@<mac-mini>             # Mac Mini'ye SSH
gt mayor attach                   # Mayor session'ına bağlan

# Görev yönetimi
bd create --title="..." --type=feature    # Yeni görev oluştur
gt convoy list                    # Aktif görevleri listele
gt convoy status <id>             # Görev detayını gör

# Sistem durumu
gt status                         # Genel durum
gt doctor                         # Sağlık kontrolü
gt dolt status                    # Dolt DB sağlığı

# İletişim
gt nudge <hedef> "mesaj"          # Hızlı mesaj (bedava)
gt mail send <hedef> -s "Konu" -m "İçerik"  # Kalıcı mesaj
```

### Polecat (Otonom Ajan) Komutları

```bash
# Başlangıç
gt prime                          # Rol ve formüla yükle
gt hook                           # Atanan işi gör
bd show <issue-id>                # Görev detayı

# Geliştirme
git checkout -b polecat/<isim> origin/main
# ... kod yaz / doküman oluştur ...
git add <dosyalar>
git commit -m "feat: açıklama (issue-id)"

# Kalite kontrol
git diff origin/main...HEAD      # Değişiklikleri gözden geçir
# Proje tipine göre: go test, npm test, cargo test vb.

# Rebase ve submit
git fetch origin main
git rebase origin/main
gt done --pre-verified --target main
```

### Witness Komutları

```bash
# Polecat izleme
gt peek <polecat>                 # Polecat durumunu kontrol et

# Escalation alma
gt mail inbox                     # HELP mesajlarını oku
```

### Tam İş Akışı (Uçtan Uca)

```
MacBook                    Mac Mini
────────                   ────────
ssh user@mini ──────────→  Bağlantı kurulur
gt mayor attach ─────────→ Mayor session'ı açılır
"X görevini yap" ────────→ Mayor:
                            ├─ bd create (issue oluştur)
                            ├─ Formüla ekle (mol-polecat-work)
                            └─ Polecat'e ata (hook)
                           
                           Polecat (otomatik):
                            ├─ gt hook → işi alır
                            ├─ gt prime → formülayı yükler
                            ├─ 8 adımı sırayla çalışır
                            ├─ git commit → kodu kaydeder
                            └─ gt done → MR submit eder
                           
                           Refinery (otomatik):
                            ├─ MR'ı alır
                            ├─ Testleri çalıştırır
                            ├─ Başarılıysa main'e merge eder
                            └─ Issue'yu kapatır
                           
gt convoy list ──────────→ Durum: merged ✓
```

## MacBook → SSH → Mac Mini Bağlantı Yapısı

### Genel Topoloji

```
┌──────────────────────┐          ┌──────────────────────────────┐
│  MacBook (Developer) │          │  Mac Mini (Gas Town Host)    │
│                      │   SSH    │                              │
│  Terminal / IDE      │─────────→│  ~/gt/          (workspace)  │
│  (Manager View)      │  Tunnel  │  Dolt (3307)    (beads DB)  │
│                      │          │  tmux sessions  (ajanlar)    │
│  git client          │←─────────│  git repos      (kod)        │
│  (pull/push)         │   SSH    │                              │
└──────────────────────┘          └──────────────────────────────┘
```

### Bağlantı Detayı

**MacBook tarafı** (Developer'ın çalıştığı makine):

- Terminal veya IDE (VS Code Remote SSH) kullanılır
- `ssh` ile Mac Mini'ye bağlanılır
- `gt` ve `bd` komutları SSH üzerinden çalıştırılır
- Git push/pull işlemleri SSH tunnel üzerinden yapılır

**Mac Mini tarafı** (Gas Town'ın yaşadığı makine):

- `~/gt/` — Gas Town workspace root
- Dolt server — port 3307'de Beads veritabanını sunar
- tmux sessionları — her ajan kendi tmux penceresinde çalışır
- `.repo.git` — her rig'in bare git reposu

### Bağlantı Kurulumu

```bash
# 1. SSH anahtarı ile Mac Mini'ye bağlan
ssh <user>@<mac-mini-ip>

# 2. Gas Town workspace'ine geç
cd ~/gt

# 3. Sistem durumunu kontrol et
gt status
gt dolt status

# 4. Mayor session'ına bağlan (görev vermek için)
gt mayor attach
```

### VS Code ile Uzaktan Çalışma

```
VS Code → Remote-SSH extension → <user>@<mac-mini>
Workspace: ~/gt/
```

Bu yapıda VS Code, Mac Mini'deki dosyaları doğrudan düzenleyebilir ve
terminal üzerinden `gt`/`bd` komutlarını çalıştırabilir.

### tmux Oturumları

Gas Town, ajanları tmux sessionlarında çalıştırır:

```bash
# Aktif sessionları listele
tmux list-sessions

# Tipik sessionlar:
# claude          → Akrobot (DOKUNMAYIN)
# gt-akos-rust    → Polecat rust
# gt-akos-witness → Witness
# hq-deacon       → Deacon
```

**Önemli**: `claude` isimli tmux session'ı Akrobot'a aittir ve asla
müdahale edilmemelidir. Ajan sessionlarını izlemek için `gt peek` kullanın.

### Ağ Yapısı

```
MacBook ──[SSH 22]──→ Mac Mini
                      ├── Dolt DB: localhost:3307
                      ├── Git SSH: git@github.com (push/pull)
                      └── tmux: yerel socket
```

- **Dolt**: Yalnızca Mac Mini üzerinde lokal erişilebilir (port 3307)
- **Git**: GitHub'a SSH üzerinden bağlanır (push/pull)
- **tmux**: Lokal Unix socket — yalnızca Mac Mini'de erişilebilir

### Güvenlik

- SSH anahtarları ile kimlik doğrulama (parola yok)
- Dolt, dış ağa açık değildir (lokal erişim)
- Her polecat izole worktree'de çalışır (birbirini etkilemez)
- Git işlemleri deploy key veya SSH key ile yapılır

## Sorun Giderme

### Dolt Bağlantı Sorunları

```bash
# Belirti: bd komutları askıda kalıyor veya hata veriyor
gt dolt status                    # Sağlık kontrolü

# Dolt'u KENDİN yeniden başlatma — önce tanı topla:
kill -QUIT $(cat ~/gt/.dolt-data/dolt.pid)    # Goroutine dump
gt dolt status 2>&1 | tee /tmp/dolt-diag.log  # Durum kaydı
gt escalate -s HIGH "Dolt: <belirti>"         # Escalate
```

### SSH Bağlantı Kopması

```bash
# Mac Mini'ye yeniden bağlan
ssh <user>@<mac-mini>
cd ~/gt

# Ajan durumlarını kontrol et
gt status
tmux list-sessions
```

### Polecat Takılması

```bash
# Witness otomatik tespit eder, ama manuel kontrol:
gt peek akos/polecats/rust        # Polecat çıktısını gör
gt nudge akos/polecats/rust "Durumun nedir?"  # Mesaj gönder
```

### Git Push Hatası

```bash
# SSH anahtarı kontrolü
ssh -T git@github.com

# Remote URL kontrolü
git remote -v
# Beklenen: git@github.com:daglierdal/<repo>.git
```
