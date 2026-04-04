# GT Skill Sistemi Araştırması

> **Tarih:** 2026-04-04
> **Yazar:** Polecat rust (ak-2cf)
> **Kapsam:** Gas Town SKILL.md formatı, rol bazlı skill pattern'leri, multi-agent skill yönetimi, CLI karşılaştırması

---

## İçindekiler

1. [Gas Town SKILL.md Formatı](#1-gas-town-skillmd-formatı)
2. [Polecat / Mayor / Witness Skill Örnekleri](#2-polecat--mayor--witness-skill-örnekleri)
3. [Multi-Agent Ortamda Skill Yönetimi](#3-multi-agent-ortamda-skill-yönetimi)
4. [Rig-Level vs Town-Level Skill Farkı](#4-rig-level-vs-town-level-skill-farkı)
5. [Steve Yegge Tavsiyeleri](#5-steve-yegge-tavsiyeleri)
6. [Claude Code, Gemini CLI, Codex Karşılaştırması](#6-claude-code-gemini-cli-codex-karşılaştırması)
7. [Sonuç ve Öneriler](#7-sonuç-ve-öneriler)
8. [Kaynaklar](#8-kaynaklar)

---

## 1. Gas Town SKILL.md Formatı

### Frontmatter Yapısı

Gas Town skill'leri, Claude Code'un [Agent Skills](https://agentskills.io) açık standardını
takip eder. Her skill bir dizin altında `SKILL.md` dosyasıyla tanımlanır:

```
~/.agents/skills/
├── planning/
│   └── SKILL.md
└── gas-town-workflow/
    └── SKILL.md
```

**Frontmatter alanları:**

```yaml
---
name: planning
description: Antigravity'de plan yapıp Gas Town Mayor'una görevi iletme iş akışı
---
```

| Alan | Zorunlu | Açıklama |
|------|---------|----------|
| `name` | Evet | Skill tanımlayıcısı (küçük harf, tire ile ayrılmış) |
| `description` | Önerilen | Skill'in ne zaman kullanılacağını açıklar. Model bu alana bakarak otomatik yükleme kararı verir |
| `disable-model-invocation` | Hayır | `true` ise sadece kullanıcı tetikleyebilir |
| `user-invocable` | Hayır | `false` ise `/` menüsünde gizlenir |
| `allowed-tools` | Hayır | Skill aktifken izin verilen araçlar |
| `context` | Hayır | `fork` ise izole subagent'ta çalışır |
| `agent` | Hayır | `context: fork` ile hangi subagent tipinin kullanılacağı |
| `argument-hint` | Hayır | Otomatik tamamlama ipucu (ör. `[issue-number]`) |

### Desteklenen Değişken Yerine Koyma

| Değişken | Açıklama |
|----------|----------|
| `$ARGUMENTS` | Skill çağrılırken iletilen tüm argümanlar |
| `$ARGUMENTS[N]` | N. argüman (0-tabanlı indeks) |
| `$N` | `$ARGUMENTS[N]` kısaltması |
| `${CLAUDE_SESSION_ID}` | Aktif oturum ID'si |
| `${CLAUDE_SKILL_DIR}` | Skill dizininin yolu |

### Shell Enjeksiyon Söz Dizimi

Skill içeriğinde `` !`<komut>` `` söz dizimi, skill yüklenmeden önce shell komutlarını
çalıştırıp çıktıyı içeriğe ekler:

```yaml
---
name: pr-summary
context: fork
agent: Explore
---

## PR bağlamı
- PR diff: !`gh pr diff`
- Değişen dosyalar: !`gh pr diff --name-only`
```

### Dizin Yapısı ve Destekleyici Dosyalar

```
my-skill/
├── SKILL.md           # Ana talimatlar (zorunlu)
├── template.md        # Doldurulan şablon
├── references/        # Ayrıntılı referans belgeleri
│   └── api-spec.md
├── examples/
│   └── sample.md      # Beklenen çıktı örnekleri
└── scripts/
    └── validate.sh    # Çalıştırılabilir betikler
```

**Best practices:**
- `SKILL.md`'yi 500 satırın altında tutun
- Ayrıntılı referans materyallerini ayrı dosyalara taşıyın
- Destekleyici dosyaları `SKILL.md`'den referans verin

---

## 2. Polecat / Mayor / Witness Skill Örnekleri

Gas Town'da skill'ler iki katmanda tanımlanır: **SKILL.md** dosyaları (Claude Code entegrasyonu)
ve **Formula TOML** dosyaları (iş akışı tanımları). Her rol için farklı pattern'ler mevcuttur.

### 2.1 Town-Level Skill'ler

`~/.agents/skills/` dizininde, tüm roller tarafından erişilebilir:

**planning** — Mayor'un plan oluşturma iş akışı:

```yaml
---
name: planning
description: Antigravity'de plan yapıp Gas Town Mayor'una görevi iletme iş akışı
---

## İyi Görev Tanımı
- Net ve ölçülebilir: "X yap ve test et"
- Bağımsız: Polecat tek başına tamamlayabilmeli
- Küçük kapsam: Tek özellik veya fix
```

**gas-town-workflow** — GT komutlarını kullanma kılavuzu:

```yaml
---
name: gas-town-workflow
description: Gas Town komutlarını kullanarak görev oluşturma, polecat yönetimi ve convoy takibi
---
```

### 2.2 Polecat Formula Pattern'leri

Polecat'ler TOML formatında tanımlanan **formüller** (molecules) ile çalışır. Bu formüller
`~/.beads/formulas/` dizininde saklanır ve iş akışı adımlarını tanımlar:

| Formül | Amaç | Rol |
|--------|------|-----|
| `mol-polecat-work` | Standart polecat iş akışı (8 adım) | Polecat |
| `mol-polecat-lease` | Polecat yaşam döngüsü takibi | Witness |
| `mol-polecat-code-review` | Kod inceleme iş akışı | Polecat |
| `mol-witness-patrol` | Devriye ve izleme | Witness |
| `mol-convoy-cleanup` | Convoy temizliği | Mayor |
| `mol-idea-to-plan` | Fikirden plana dönüştürme | Mayor |
| `mol-gastown-boot` | Sistem başlatma | Mayor |
| `mol-deacon-patrol` | Deacon devriye görevi | Deacon |
| `mol-dog-backup` | Yedekleme görevi | Dog |

**Formül TOML Yapısı:**

```toml
description = """
Witness-side tracking of a single polecat's lifecycle.
"""
formula = "mol-polecat-lease"
version = 2

[[steps]]
id = "boot"
title = "Verify polecat boots successfully"
description = """
Polecat has been spawned. Verify it initializes...
"""
```

### 2.3 Claude Code Komut Skill'leri

Her rol için `.claude/commands/` dizininde tanımlanan slash komutları:

```yaml
# .claude/commands/done.md
---
description: Signal work complete and submit to merge queue
allowed-tools: Bash(gt done:*), Bash(git status:*), Bash(git log:*)
argument-hint: [--status COMPLETED|ESCALATED|DEFERRED] [--pre-verified]
---
```

| Komut | Roller | Açıklama |
|-------|--------|----------|
| `/done` | Tüm roller | İşi tamamla ve merge queue'ya gönder |
| `/review` | Tüm roller | Yapılandırılmış kod inceleme (A-F notlama) |
| `/handoff` | Tüm roller | Yeni oturuma devir |

---

## 3. Multi-Agent Ortamda Skill Yönetimi

### 3.1 Mevcut Framework Yaklaşımları

Multi-agent sistemlerde skill/tool yönetimi için üç temel pattern bulunur:

| Framework | Yaklaşım | Skill Paylaşımı | Avantaj |
|-----------|----------|-----------------|---------|
| **CrewAI** | Rol-tabanlı | Her agent'a atanan tool'lar | Basit, anlaşılır |
| **LangGraph** | Graf-tabanlı | Node'lar arası tool geçişi | Esnek iş akışları |
| **AutoGen** | Konuşma-tabanlı | Dinamik rol değişimi | Adaptif |
| **Gas Town** | Formül-tabanlı | Beads + Molecules | İş akışı dayanıklılığı |

### 3.2 Paylaşımlı Registry Pattern'leri

**Merkezi Registry (Centralized):**
- Tüm skill'ler tek bir konumda tanımlanır
- Keşif (discovery) kolaydır
- Örnek: Gas Town `~/.agents/skills/` dizini

**Dağıtık Registry (Decentralized):**
- Her agent kendi skill setini taşır
- Bağımsızlık sağlar
- Örnek: Claude Code `.claude/skills/` dizini (proje bazlı)

**Hiyerarşik Registry (Hierarchical):**
- Katmanlı öncelik sistemi
- Daha spesifik tanımlar daha genel olanları geçersiz kılar
- Örnek: Claude Code'un Enterprise > Personal > Project hiyerarşisi

### 3.3 Skill Discovery Mekanizmaları

Claude Code'un skill keşif mekanizması Gas Town için referans modeldir:

1. **Başlangıçta:** Tüm skill meta verileri (name, description) context'e yüklenir
2. **Tetikleme:** Kullanıcı isteği veya dosya pattern'i eşleştiğinde tam skill yüklenir
3. **Progressive Disclosure:** Önce yalnızca meta veri, sonra gerektiğinde tam içerik
4. **Otomatik Keşif:** Alt dizinlerdeki `.claude/skills/` dizinleri otomatik taranır

**Gas Town'da keşif sırası:**

```
~/.agents/skills/           → Town-level (tüm roller)
<rig>/.claude/skills/       → Rig-level (rig'e özgü)
<worktree>/.claude/skills/  → Proje-level (proje'ye özgü)
Plugin skills/              → Plugin namespace'i (plugin:skill-name)
```

---

## 4. Rig-Level vs Town-Level Skill Farkı

### Town-Level Skill'ler

**Konum:** `~/.agents/skills/` veya Gas Town çekirdek dizini

**Özellikler:**
- Tüm rig'ler ve roller tarafından erişilebilir
- Genel iş akışı bilgisi içerir
- GT komutları ve ortak pattern'leri tanımlar

**Mevcut örnekler:**
- `planning` — genel plan oluşturma rehberi
- `gas-town-workflow` — GT komut referansı

### Rig-Level Skill'ler

**Konum:** `<rig>/.claude/skills/` veya rig-specific dizinler

**Özellikler:**
- Belirli bir rig'e (proje) özgüdür
- Proje konvansiyonlarını ve teknoloji stack'ini tanımlar
- Rig'in kendine özgü iş akışlarını içerir

**Karşılaştırma tablosu:**

| Özellik | Town-Level | Rig-Level |
|---------|-----------|-----------|
| **Kapsam** | Tüm rig'ler | Tek rig |
| **İçerik** | GT komutları, genel pattern'ler | Proje-specific konvansiyonlar |
| **Yönetim** | Merkezi (GT operatörü) | Dağıtık (rig sahibi) |
| **Öncelik** | Düşük (genel) | Yüksek (spesifik) |
| **Örnekler** | planning, gas-town-workflow | api-conventions, deploy |
| **Güncelleme** | Nadiren, koordineli | Sık, bağımsız |

### Formül vs Skill Farkı

Gas Town'da **formüller** (TOML) ve **skill'ler** (SKILL.md) birbirini tamamlar:

| Özellik | Formül (TOML) | Skill (SKILL.md) |
|---------|---------------|-------------------|
| **Format** | TOML | YAML frontmatter + Markdown |
| **Amaç** | Adım-adım iş akışı tanımı | Bilgi ve yetenek enjeksiyonu |
| **Çalışma** | Beads sistemi ile yönetilir | Claude Code tarafından yüklenir |
| **Değişkenler** | `{{issue}}`, `{{rig}}` | `$ARGUMENTS`, `${CLAUDE_SESSION_ID}` |
| **Durum takibi** | Evet (adım bazlı) | Hayır (stateless) |
| **Kalıcılık** | Dolt veritabanında | Dosya sisteminde |

---

## 5. Steve Yegge Tavsiyeleri

Steve Yegge'nin Gas Town, Beads ve agentic geliştirme hakkındaki yazıları, skill sistemi
tasarımı için temel ilkeleri ortaya koyar.

### 5.1 "Physics Over Politeness" İlkesi

Yegge'ye göre Claude Code "sefil derecede kibar"dır — kullanıcı onayı bekler, çalışmak
yerine. Gas Town bu sorunu **GUPP (Gastown Universal Propulsion Principle)** ile çözer:
agent'lar hook'larını kontrol eder ve atanmış molecule'leri onay beklemeden çalıştırır.

**Skill tasarımına etkisi:** Skill'ler deklaratif iş akışları olmalı, interaktif diyaloglar
değil. Agent izin sormak yerine önceden tanımlanmış sekansları takip etmeli.

### 5.2 Skill'leri İş Akışı Olarak Kodla

Yegge'nin temel tavsiyesi: **İzole tool'lar yerine bileşik iş akışları (molecules) tasarla.**

Molecule'ler — zincirlenmiş Bead'ler — agent'ların oturum sınırları boyunca karmaşık,
çok adımlı süreçleri güvenilir şekilde yürütmesini sağlar. Çok sayıda izole tool vermek
yerine, önceden tanımlanmış tool sekansları oluşturun.

### 5.3 Şablon Kullanarak Tutarlılık Sağla

**Protomolecule'ler** yeniden kullanılabilir iş akışı şablonları olarak görev yapar.
Formüller (TOML tanımları) makro genişletme ve karmaşık iş akışı bileşimi sağlar.
Bu, agent karar verme yükünü azaltır.

### 5.4 Hiyerarşik Gözetim

Tool güvenliği için katmanlı agent yapısı:
- **Witness** → Polecat'leri izler
- **Deacon** → Devriye iş akışlarını koordine eder
- **Refinery** → Merge çakışmalarını yönetir

Bu yapı, özerkliği korurken başıboş tool kullanımını önler.

### 5.5 Git-Destekli Durum Kalıcılığı

Agent kimliği, iş atamaları ve tool çağrı geçmişi Bead'lerde (Git-backed veri
yapıları) saklanarak çökme kurtarma ve forensik analiz sağlanır.

### 5.6 Altı Dalga Modeli

Yegge'nin programlama evrim modeli skill tasarımını etkiler:

| Dalga | Dönem | Skill İhtiyacı |
|-------|--------|---------------|
| Geleneksel | 2022 | — |
| Tamamlama-tabanlı | 2023 | İpuçları |
| Chat-tabanlı | 2024 | Konuşma bağlamı |
| Coding agent'lar | 2025 H1 | Tool tanımları |
| Agent kümeleri | 2025 H2 | Paylaşımlı skill registry |
| Agent filoları | 2026 | Orkestrasyon + formüller |

**Kaynak:**
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) — Steve Yegge, Medium
- [The Future of Coding Agents](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c) — Steve Yegge, Medium
- [Steve Yegge on AI Agents](https://newsletter.pragmaticengineer.com/p/steve-yegge-on-ai-agents-and-the) — The Pragmatic Engineer
- [Gas Town, Beads, and Agentic Development](https://pod.wave.co/podcast/software-engineering-daily/gas-town-beads-and-the-rise-of-agentic-development-with-steve-yegge) — Software Engineering Daily

---

## 6. Claude Code, Gemini CLI, Codex Karşılaştırması

### 6.1 Genel Bakış

Üç büyük CLI aracı da skill/extension sistemine sahiptir. Aralık 2025'te Anthropic'in
Agent Skills'ı açık standart olarak yayımlamasının ardından, OpenAI da aynı standardı
benimsemiştir.

### 6.2 Karşılaştırma Tablosu

| Özellik | Claude Code | Gemini CLI | Codex CLI |
|---------|------------|------------|-----------|
| **Skill dosyası** | `SKILL.md` (YAML frontmatter) | `gemini-extension.json` + `GEMINI.md` | `SKILL.md` (YAML frontmatter) |
| **Komut formatı** | Markdown (`.md`) | TOML (`.toml`) | Markdown (`.md`) |
| **MCP desteği** | Evet (plugin sistemiyle) | Evet (extension manifest) | Evet (AGENTS.md + MCP) |
| **Açık standart** | Agent Skills (agentskills.io) | Kendi formatı | Agent Skills (agentskills.io) |
| **Keşif dizinleri** | `.claude/skills/`, `~/.claude/skills/` | Extension registry | `.agents/skills/`, `~/.agents/skills/` |
| **Otomatik tetikleme** | Evet (description eşleştirme) | Evet (bağlamsal) | Evet (implicit invocation) |
| **Subagent desteği** | `context: fork` + `agent:` | Hayır (MCP üzerinden) | `agents/openai.yaml` |
| **Shell enjeksiyonu** | `` !`cmd` `` söz dizimi | `!{cmd}` söz dizimi | Yok |
| **Değişken yerine koyma** | `$ARGUMENTS`, `${CLAUDE_SESSION_ID}` | `{{args}}` | — |
| **Hiyerarşi** | Enterprise > Personal > Project | Global > User | System > Admin > User > Repo |
| **Plugin sistemi** | Evet (namespace'li skill'ler) | Evet (extension marketplace) | Yok (doğrudan skill) |

### 6.3 Claude Code Skill Sistemi

Claude Code'un skill sistemi, Aralık 2025'te açık standart olarak yayımlanmış ve Ocak 2026'da
hot-reloading desteği eklenmiştir.

**Temel özellikler:**
- **Progressive disclosure:** Başlangıçta yalnızca name/description yüklenir, tam içerik
  çağrılınca yüklenir
- **Çift yönlü tetikleme:** Kullanıcı `/skill-name` ile veya model otomatik olarak
  tetikleyebilir
- **Subagent entegrasyonu:** `context: fork` ile izole ortamda çalıştırma
- **Monorepo desteği:** Alt dizinlerdeki `.claude/skills/` otomatik keşfedilir

**Skill konumları (öncelik sırasıyla):**

| Seviye | Konum | Kapsam |
|--------|-------|--------|
| Enterprise | Managed settings | Organizasyon geneli |
| Personal | `~/.claude/skills/` | Tüm projeler |
| Project | `.claude/skills/` | Bu proje |
| Plugin | `<plugin>/skills/` | Plugin aktifken |

### 6.4 Gemini CLI Extension Sistemi

Ekim 2025'te piyasaya sürülen Gemini CLI extension'ları, kapsamlı bir özelleştirme
sistemi sunar.

**Temel yapı:**

```
my-extension/
├── gemini-extension.json   # Manifest (JSON)
├── GEMINI.md               # Bağlam dosyası
├── commands/               # TOML komutları
│   └── deploy.toml
├── skills/                 # Agent skill'leri
└── package.json            # Node.js bağımlılıkları
```

**Manifest örneği:**

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "contextFileName": "GEMINI.md",
  "mcpServers": {
    "server": {
      "command": "node",
      "args": ["${extensionPath}/server.js"]
    }
  }
}
```

**Farklar:**
- Extension'lar paket olarak dağıtılır (skill + MCP + commands + context birlikte)
- TOML tabanlı komut tanımı (Claude Code ve Codex'te Markdown)
- `gemini extensions install <url>` ile kurulum
- Google, Figma, Stripe, Shopify gibi ortaklardan hazır extension'lar

### 6.5 OpenAI Codex CLI Skill Sistemi

Codex, Claude Code ile aynı Agent Skills açık standardını benimsemiştir.

**Keşif konumları (öncelik sırasıyla):**

| Seviye | Konum |
|--------|-------|
| Repository-specific | `.agents/skills/` (çalışma dizini) |
| Repository-wide | `.agents/skills/` (repo kökü) |
| User | `$HOME/.agents/skills/` |
| Admin | `/etc/codex/skills/` |
| System | Bundled skill'ler |

**Ek yapılandırma:** `agents/openai.yaml` dosyası ile UI sunumu ve çağrı davranışı
kontrol edilebilir:

```yaml
interface:
  display_name: "User-facing name"
  brand_color: "#3B82F6"
policy:
  allow_implicit_invocation: false
dependencies:
  tools:
    - type: "mcp"
      value: "toolName"
```

### 6.6 Yakınsama Eğilimi

2025-2026 döneminde üç önemli eğilim gözlemlenmektedir:

1. **Standartlaşma:** Agent Skills açık standardı Claude Code ve Codex tarafından
   benimsenmiş; Gemini CLI kendi formatını korumakla birlikte skill dizin yapısını
   desteklemektedir.

2. **Progressive Disclosure:** Tüm sistemler başlangıçta minimum meta veri yükleyip
   gerektiğinde tam içerik yükleme stratejisini benimsemiştir.

3. **MCP Entegrasyonu:** Üç sistem de Model Context Protocol üzerinden harici araç
   entegrasyonunu destekler.

---

## 7. Sonuç ve Öneriler

### Gas Town Skill Sistemi İçin Öneriler

1. **Mevcut yapıyı genişlet:** `~/.agents/skills/` dizini town-level skill'ler için iyi
   bir temel sağlar. Rig-level skill'ler için `<rig>/.claude/skills/` kullanılmalı.

2. **Formül-Skill entegrasyonu:** Formüller (TOML) iş akışı orkestasyonunu, skill'ler
   (SKILL.md) bilgi enjeksiyonunu sağlar. İkisini birlikte kullanmak en güçlü pattern'dir.

3. **Rol-bazlı skill seti:** Her rol (Polecat, Mayor, Witness, Deacon) için optimize
   edilmiş skill setleri oluşturulmalı:
   - **Polecat:** Implementasyon, test, commit pattern'leri
   - **Mayor:** Planlama, atama, triage skill'leri
   - **Witness:** İzleme, doğrulama, devriye skill'leri
   - **Deacon:** Bakım, temizlik, sağlık kontrolü skill'leri

4. **Progressive disclosure uygula:** Skill description'ları kısa ve keşif-dostu tutulmalı.
   Tam içerik yalnızca gerektiğinde yüklenmeli.

5. **Agent Skills standardını takip et:** Claude Code ve Codex'in ortak standardı olan
   [Agent Skills](https://agentskills.io) formatı, Gas Town skill'leri için de kullanılmalı.
   Bu, ekosistemler arası taşınabilirlik sağlar.

6. **Formüllerde skill referansları:** Formül adımları, ilgili skill'lere referans verebilir.
   Böylece bir formül adımı çalıştırılırken gerekli bilgi otomatik enjekte edilir.

---

## 8. Kaynaklar

### Steve Yegge Yazıları
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) — Gas Town tanıtımı ve felsefesi
- [The Future of Coding Agents](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c) — Agent gelişim modeli
- [Software Survival 3.0](https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b) — AI-first yazılım geliştirme
- [The AI Vampire](https://steve-yegge.medium.com/the-ai-vampire-eda6e4f07163) — AI agent evrimi (Şubat 2026)
- [Steve Yegge on AI Agents](https://newsletter.pragmaticengineer.com/p/steve-yegge-on-ai-agents-and-the) — The Pragmatic Engineer röportajı
- [Gas Town, Beads, and Agentic Development](https://pod.wave.co/podcast/software-engineering-daily/gas-town-beads-and-the-rise-of-agentic-development-with-steve-yegge) — SE Daily podcast

### Claude Code Skill Sistemi
- [Extend Claude with Skills — Claude Code Docs](https://code.claude.com/docs/en/skills) — Resmi dokümantasyon
- [Agent Skills Open Standard](https://agentskills.io) — Açık standart spesifikasyonu
- [Claude Code Customization Guide](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/) — Kapsamlı rehber
- [Essential Claude Code Skills](https://batsov.com/articles/2026/03/11/essential-claude-code-skills-and-commands/) — Skill örnekleri

### Gemini CLI
- [Gemini CLI Extensions](https://geminicli.com/docs/extensions/) — Resmi dokümantasyon
- [Build Gemini CLI Extensions](https://geminicli.com/docs/extensions/writing-extensions/) — Geliştirici rehberi
- [Extension Reference](https://geminicli.com/docs/extensions/reference/) — Referans dokümanı
- [Gemini CLI Extensions Announcement](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-cli-extensions/) — Google blog

### OpenAI Codex
- [Agent Skills — Codex](https://developers.openai.com/codex/skills) — Resmi dokümantasyon
- [Codex CLI Features](https://developers.openai.com/codex/cli/features) — CLI özellikleri
- [Codex GitHub Repository](https://github.com/openai/codex) — Açık kaynak repo

### Multi-Agent Framework'ler
- [Multi-Agent Frameworks Explained](https://www.adopt.ai/blog/multi-agent-frameworks) — Framework karşılaştırması
- [CrewAI vs LangGraph vs AutoGen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen) — DataCamp karşılaştırması
- [AI Agent Framework Comparison](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026) — 2026 güncel karşılaştırma
- [Comparing Open-Source Agent Frameworks](https://langfuse.com/blog/2025-03-19-ai-agent-comparison) — Langfuse analizi
