# GT Multi-Agent Patterns

> Gas Town cok-ajanli mimarileri, agent yonlendirme stratejileri ve maliyet
> optimizasyonu uzerine arastirma dokumani.

**Tarih:** 2026-04-04
**Kapsam:** Multi-agent orchestration frameworkleri, routing stratejileri,
maliyet kontrolu, polecat spawn stratejileri

---

## Icindekiler

1. [Giris](#giris)
2. [Multi-Agent Orkestrasyon Frameworkleri](#multi-agent-orkestrasyon-frameworkleri)
3. [Agent Routing Stratejileri](#agent-routing-stratejileri)
4. [Maliyet Optimizasyonu](#maliyet-optimizasyonu)
5. [Polecat Spawn Stratejileri: Paralel vs Sirali](#polecat-spawn-stratejileri-paralel-vs-sirali)
6. [Basarili Multi-Agent Uygulamalari](#basarili-multi-agent-uygulamalari)
7. [Gas Town Mimarisi ile Karsilastirma](#gas-town-mimarisi-ile-karsilastirma)
8. [Sonuclar ve Oneriler](#sonuclar-ve-oneriler)

---

## Giris

Yapay zeka destekli yazilim gelistirme, tek bir buyuk dil modelinin (LLM)
sorgulara yanit vermesinin cok otesine gecti. Modern sistemler, birden fazla
ajani koordineli olarak calistirarak karmasik gorevleri parcalara ayirip
paralel veya sirali sekilde isliyorlar. Bu yaklasim, **multi-agent
orchestration** olarak biliniyor.

Gas Town, bu felsefenin canli bir uygulamasi: Polecat'ler (isci ajanlar)
bagimsiz worktree'lerde paralel olarak calisir, Witness dogrulama yapar,
Refinery merge queue'yu yonetir. Ancak bu mimari tek degil — sektorde
onlarca farkli yaklasim ve framework mevcut.

Bu dokuman, Gun Town'un multi-agent mimarisini sektorun geri kalaniyla
karsilastirarak ogrenilebilecek kaliplari, routing stratejilerini ve maliyet
optimizasyon tekniklerini inceler.

---

## Multi-Agent Orkestrasyon Frameworkleri

### Framework Karsilastirma Tablosu

| Framework | Mimari | Dil | Lisans | Guc | Zayiflik |
|-----------|--------|-----|--------|-----|----------|
| **CrewAI** | Rol-tabanli takim | Python | MIT | Sezgisel API, hizli baslangic | Karmasik akislarda sinirli |
| **AutoGen** (Microsoft) | Actor/mesajlasma | Python | MIT | Dagitik calisma, esnek | 0.2→0.4 kirilma, ogrenme egrisi |
| **LangGraph** (LangChain) | Durum makinesi grafi | Python/JS | MIT | Maksimum esneklik, checkpoint | Verbose tanimlar, karmasik kurulum |
| **Swarm** (OpenAI) | Handoff-tabanli | Python | MIT | Cok basit (~500 satir) | Uretim icin uygun degil |
| **Claude Code / Agent SDK** | Tool-use + sub-agent | TS/Python | Ticari | Genis context, native tool-use | Resmi orkestrasyon framework yok |
| **Google ADK** | Kompozit agent tipleri | Python | Apache 2.0 | Vertex AI entegrasyonu | Google ekosistem bagimli, yeni |

### CrewAI

CrewAI, rol-tabanli bir agent framework'udur. Her ajan bir "rol", "amac"
ve "arka plan hikayesi" ile tanimlanir. Ajanlar "murettebat" (crew) olarak
gruplanir ve sirali veya hiyerarsik sureclerle isbirligi yapar.

**Guclu yanlari:**
- Sezgisel API — rol/amac/hikaye metaforu kolayca anlasilir
- Guclu topluluk benimsemesi (2024'te en hizli buyuyen agent framework)
- Ajanlar arasi delegasyon destegi (bir ajan, gorevi baska bir ajana devredebilir)
- CrewAI Enterprise (2024) ile gozlemlenebilirlik panelleri

**Zayif yanlari:**
- Soyutlama katmani karmasik is akislari icin kisitlayici
- Hiyerarsik surec, ekstra "yonetici" ajani gerektirir (token maliyeti artar)
- Graf-tabanli yaklasimlara gore dogrusal olmayan akislarda daha az esnek

**Kaynak:** [github.com/crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)

### AutoGen (Microsoft)

AutoGen, konusma-odakli cok-ajanli bir framework'tur. Ajanlar, grup
sohbetlerinde mesaj gecisi yoluyla iletisim kurar. AutoGen 0.4 (2024 sonu)
tamamen yeniden yazildi: olay-tabanli cekirdek (actor runtime), dagitik
calisma (gRPC), ve "Takim" konseptleri (RoundRobinGroupChat,
SelectorGroupChat, MagenticOne).

**Guclu yanlari:**
- Son derece esnek — ajanlar kompozit aktorler
- Human-in-the-loop icin birinci sinif destek
- AutoGen Studio ile kodsuz arayuz
- MagenticOne, GAIA ve WebArena benchmark'larinda guclu performans

**Zayif yanlari:**
- 0.2'den 0.4'e gecis geriye uyumlulugu kirdi
- Actor modeli kavramsal yuk ekler
- Basit framework'lere gore daha agir kurulum

**Kaynak:** [github.com/microsoft/autogen](https://github.com/microsoft/autogen)

### LangGraph (LangChain)

LangGraph, graf-tabanli agent orkestrasyon framework'udur. Is akislari,
durum makineleri (yonlu graflar) olarak tanimlanir — dugumler ajan
adimlari, kenarlar kosullu gecislerdir.

**Guclu yanlari:**
- Maksimum esneklik — herhangi bir is akisi topolojisi (donguler, dallanma, paralel fan-out)
- Dahili durum kaliciligi ve kontrol noktasi (checkpoint) — kesintiye ugramis is akislari devam ettirilebilir
- "Interrupt" dugumleri ile human-in-the-loop
- Zaman yolculugu hata ayiklama (time-travel debugging)
- En iyi streaming destegi

**Zayif yanlari:**
- Dik ogrenme egrisi — graf tanimlari verbose
- LangChain ekosistemiyle sikica bagli (2025'te ayrisma iyilesti)
- Basit kullanim icin asiri muhendislik (over-engineering)

**Kaynak:** [github.com/langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)

### Swarm (OpenAI)

Swarm, OpenAI'nin Ekim 2024'te yayinladigi egitim amacli, hafif bir
framework'tur. Ajanlar, talimatlar ve araclarla tanimlanir. Ozel
`transfer_to_agent_X` araci, ajanlar arasi gecis saglar.

**Guclu yanlari:**
- Son derece basit (~500 satir kod)
- Handoff desenini anlamak kolay
- Cok-ajanli kavramlari ogrenme icin iyi baslangic

**Zayif yanlari:**
- Acikca uretim icin uygun degil olarak isaretlenmis
- Durum yonetimi, kalicilik veya gozlemlenebilirlik yok
- Her turda tam context tekrari (pahali)
- Yalnizca OpenAI modelleri

**Kaynak:** [github.com/openai/swarm](https://github.com/openai/swarm)

### Claude Code / Anthropic Agent SDK

Anthropic'in yaklasimi, ayri bir orkestrasyon framework'u yerine Claude'un
yerel tool-use ve genisletilmis dusunme (extended thinking) yeteneklerine
dayanir. Claude Code, alt-ajanlar (sub-agents) olusturabilen tek-ajan-araclarla
desenini gosterir. Anthropic, Aralik 2024'te yayinladigi "Building Effective
Agents" rehberinde, karmasik cok-ajanli framework'lar yerine daha basit
mimarileri savunur.

**Guclu yanlari:**
- 200K+ context penceresi, karmasik bellek/durum yonetimine ihtiyaci azaltir
- Yerel tool-use saglam ve guvenilir
- Alt-ajan olusturma, paralel calismaya olanak tanir
- Basitlik ve bilesebilirlik (composability) vurgusu

**Zayif yanlari:**
- Antropic'ten resmi bir multi-agent orkestrasyon framework'u yok (bilerek)
- Karmasik is akislari icin ucuncu taraf framework'lara (LangGraph, Vercel AI SDK) bagimli

**Kaynak:** [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents)

### Google ADK (Agent Development Kit)

Nisan 2025'te yayinlanan Google ADK, Python-once bir agent framework'udur.
Tek ajanlar, sirali pipeline'lar, paralel fan-out ve dongu ajanlari destekler.
Ajanlar kompozittir — bir ajan, baska bir ajanin araci olabilir.

**Guclu yanlari:**
- Derin Vertex AI entegrasyonu
- Birden fazla ajan tipi: `LlmAgent`, `SequentialAgent`, `ParallelAgent`, `LoopAgent`
- Dahili oturum/bellek yonetimi (`SessionService`)
- Gemini'nin grounding ve kod calistirma yetenekleriyle entegrasyon
- Degerlendirme framework'u dahil

**Zayif yanlari:**
- Google Cloud ekosistemine guclu bagli
- Nispeten yeni — daha az savastan gecmis (battle-tested)
- Lansmanda yalnizca Python

**Kaynak:** [github.com/google/adk-python](https://github.com/google/adk-python)

---

## Agent Routing Stratejileri

Agent routing, "hangi gorev hangi modele/ajana gider?" sorusunun
cevaplandigi katmandir. Dogru routing, hem maliyet hem kalite icin
kritik oneme sahiptir.

### 1. Beceri-Tabanli Routing (Skill-Based)

Her model farkli alanlarda gucludur. Gorev turune gore model secimi:

| Gorev Turu | Onerien Model(ler) | Neden |
|------------|-------------------|-------|
| Kod uretimi/debugging | Claude Sonnet/Opus, GPT-4o | SWE-Bench liderleri |
| Derin muhakeme/analiz | Claude Opus, o3, Gemini 2.5 Pro | Extended thinking/CoT guclu |
| Basit siniflandirma/cikartim | Claude Haiku, GPT-4o-mini, Gemini Flash | Hizli, ucuz, yeterli |
| Uzun-context isleme | Gemini 2.5 Pro (1M token), Claude (200K) | Buyuk girdi kapasitesi |
| Multimodal gorevler | GPT-4o, Gemini | Gorsel/video/ses anlama |

**Uygulama deseni:** Bir "yonlendirici" ajan (genellikle daha ucuz bir model),
gelen gorevi siniflandirir ve uygun uzman modele gonderir. Vercel AI Gateway
ve Anthropic'in ic yonlendirme sistemi bu deseni kullanir.

### 2. Maliyet-Tabanli Routing (Cost-Based)

Katmanli yaklasim — gorevler en ucuz uygulanabilir modelle baslar:

```
Katman 1 (Ekonomik): Haiku / GPT-4o-mini / Flash
  → Basit sorgular, siniflandirma, veri cikarimi

Katman 2 (Standart): Sonnet / GPT-4o / Gemini Pro
  → Karmasik uretim, cok adimli muhakeme, kodlama

Katman 3 (Premium): Opus / o3 / Gemini Ultra
  → En zor problemler, yuksek riskli kararlar
```

**Kademeli yukseltme deseni (Cascade):** Katman 1'de basla. Guven dusukse
veya gorev yukseltme gerektiriyorsa, Katman 2'ye, ardidan Katman 3'e gec.
[Unify.ai](https://unify.ai) ve [Martian](https://withmartian.com) bu desen
uzerine urun insa etmis sirketlerdir.

### 3. Gecikme-Tabanli Routing (Latency-Based)

Gercek zamanli uygulamalarda beklenen yanit suresine gore yonlendirme:

| Gecikme Butcesi | Model Secimi | Kullanim Alani |
|----------------|-------------|----------------|
| <1 saniye | Onbellek sonuclari, Haiku, Flash | Otomatik tamamlama |
| 1-5 saniye | Sonnet, GPT-4o | Interaktif sohbet |
| 5+ saniye | Opus, o3 | Arka plan isleri, batch |

Streaming, algilanan gecikmeyi azaltir — toplam uretim suresinden ziyade
ilk-token-suresi (TTFT) onemlidir.

### 4. Hibrit Routing (2025-2026 Ortaya Cikan Desen)

En sofistike uretim sistemleri uc boyutu birlestiriyor:

1. Gorev turunu siniflandir (beceri routing)
2. Karmasikligi degerlendir (minimum katman belirle)
3. Gecikme butcesini kontrol et (daha hizli model zorlayabilir)
4. Maliyet butcesini kontrol et (daha ucuz model zorlayabilir)
5. Uygulanabilir kumeden optimal modeli sec

**Vercel AI Gateway** (`ai-gateway.vercel.sh`), saglayicilar arasi birlesik
API sunarak istek basina model degistirmeyi kolaylastirir — bu desenin
pratik bir uygulamasidir.

---

## Maliyet Optimizasyonu

Multi-agent sistemlerde maliyet kontrolu, olceklenebilirlik icin kritiktir.
Asagida kanıtlanmis optimizasyon teknikleri yer aliyor.

### Katman Yonetimi (Tier Management)

En yuksek etkili tek optimizasyon. Yaklasik maliyet oranlari (2026 basi):

| Katman | Ornek Modeller | Girdi $/MTok | Cikti $/MTok | Kullanim |
|--------|---------------|-------------|-------------|----------|
| Ekonomik | Haiku 3.5, GPT-4o-mini, Flash 2.0 | $0.10-$1.00 | $0.40-$4.00 | Siniflandirma, cikarim, routing |
| Standart | Sonnet 4, GPT-4o, Gemini 2.5 Pro | $3.00-$5.00 | $10-$15 | Karmasik uretim, analiz, kodlama |
| Premium | Opus 4, o3, Gemini Ultra | $10-$15 | $40-$75 | Zor muhakeme, kritik kararlar |

**Temel kural:** Tipik bir multi-agent sistemdeki gorevlerin %80'i Ekonomik
katman tarafindan ele alinabilir. Standart/Premium'u, ihtiyac duyan %20'lik
dilim icin saklayin. Bu tek basina maliyetleri %60-80 azaltabilir.

### Token Butceleme

- **Ajan basina maxTokens:** Her ajan rolu icin acik cikti token limitleri
  belirleyin. Bir ozetleyicinin 500 tokene ihtiyaci var, 4096'ya degil.
- **Context penceresi yonetimi:** Ajanlar arasi tam transkripsiyonlar
  gecirmek yerine konusma gecmisini agresif bir sekilde ozetleyin. Her
  ajan devri bir sikistirma firsatidir.
- **Prompt optimizasyonu:** Daha kisa sistem promptlari her istekte tasarruf
  saglar. Prompt token sayilarini olcun ve duzenli olarak kirpin.
- **Extended thinking butceleri:** Dusunme tokenli modeller icin (Claude,
  o-serisi), gorev karmasikligina uygun dusunme butceleri ayarlayin.
  Basit gorevler: 1024 token. Zor muhakeme: 10K+.

### Onbellekleme (Caching) Stratejileri

| Strateji | Aciklama | Tasarruf |
|----------|----------|---------|
| **Anthropic Prompt Caching** | Statik sistem promptlarini ve tool tanimlarini onbellekle | Onbellek kullanilan tokenlar %90 daha ucuz |
| **OpenAI Prompt Caching** | >1024 token eslesme ile otomatik onbellekleme | Onbellek girdi tokenlarinda %50 indirim |
| **Semantik onbellekleme** | Anlamsal olarak benzer sorgulara onbellek yanitlari | API cagrilarinda %20-40 azalma |
| **Arac sonucu onbellekleme** | Deterministik arac cagrilarini onbellekle | Gereksiz arac cagrilarini elimine eder |

### Batch Isleme

- **OpenAI Batch API:** Gercek zamanli olmayan is yukleri icin %50 maliyet
  indirimi. Veri isleme, degerlendirme, icerik uretimi icin ideal.
- **Anthropic Message Batches:** Benzer desen — toplu istekler icin asenkron
  isleme, dusuk maliyetle.
- **Ajan-seviyesi toplama:** Birden fazla alt gorevi toplayin ve ayri ajanlar
  olusturmak yerine tek bir ajan cagrisinda isleyin. 5 arac cagrili tek ajan,
  1 arac cagrili 5 ajandan daha ucuzdur (sistem prompt tokenlari tasarrufu).

### Diger Optimizasyonlar

- **Erken sonlandirma:** Ajan gorev basitse hemen dondu, tum adimlari
  gecmesin.
- **Spekulatif calistirma:** Once ucuz modeli calistir. Guven > esik ise
  sonucu kullan. Aksi halde pahali modelin sonucunu bekle.
- **Yapilandirilmis ciktilar:** JSON modu / structured outputs ile
  gereksiz aciklayici metin uretimini azalt.

---

## Polecat Spawn Stratejileri: Paralel vs Sirali

Gas Town'un polecat modeli, gercek dunya multi-agent sistemlerindeki temel
tasarim kararini yansitir: **ne zaman paralel, ne zaman sirali?**

### Sirali Calistirma Ne Zaman?

- **Bagimlilk zincirleri:** B adimi, A adiminin ciktisina ihtiyac duyar.
  Ornek: "Konuyu arastir, arastirmaya dayanarak makale yaz, makaleyi duzenle."
- **Yinelemeli iyilestirme:** Ajan A taslak uretir, Ajan B elestirir,
  Ajan A revize eder. Dongu dogasi geregi siralidir.
- **Durum birikimi:** Her adim biriken durumun uzerine insa eder.
- **Butce kontrolu:** Sirali calisma maliyeti ongortlebilir kilar ve erken
  sonlandirmaya izin verir.

**Desen:** Pipeline / Zincir — her ajanin ciktisi sonraki ajanin girdisini besler.

### Paralel Calistirma Ne Zaman?

- **Bagimsiz alt gorevler:** Bagimliligi olmayan birden fazla gorev.
  Ornek: "10 dokumani ozetle" — her ozet bagimsiz.
- **Fan-out/fan-in:** Koordinator isi bagimsiz parcalara boler,
  isciler paralel isler, sonuclar birlestirilir.
  Ornek: "5 rakibi arastir" — her arastirma bagimsiz, sonra bulgulari birles.
- **Yedeklilik/oylama:** Ayni gorevi birden fazla modelde calistir,
  uzlasmayi veya en iyi sonucu al. Yuksek riskli kararlar icin faydali.
- **Gecikme azaltma:** Duvar saati suresi `max(ajan_sureleri)` olur,
  `toplam(ajan_sureleri)` degil.

**Desen:** Map-Reduce / Scatter-Gather — bol, paralel isle, birlestir.

### Karsilastirma Tablosu

| Boyut | Sirali | Paralel |
|-------|--------|---------|
| Gecikme | Tum adimlarin toplami | En uzun adimin suresi |
| Maliyet | Daha dusuk (erken cikis mumkun) | Daha yuksek (tum dallar calisir) |
| Karmasiklik | Basit dogrusal akis | Koordinasyon ve birlestirme gerekir |
| Hata yonetimi | Hatada dur | Kismi hata yonetimi gerekli |
| Token verimliligi | Context dogal olarak buyur | Her dal bastan baslar (sistem promptlari tekrarlanir) |
| Hata ayiklama | Kolay izleme | Iliskilendirmesi daha zor |

### Gas Town Polecat Spawn Desenleri

Gas Town'da polecat'ler su sekilde olusturulur:

**1. Paralel Spawn (Varsayilan — Bagimsiz Isler):**

Her is (bead) bagimsiz bir worktree'de calisir. Birden fazla polecat,
ayni anda farkli konularda calisabilir. Ornek: `chrome`, `rust`, `nitro`
polecat'leri ayni anda farkli issue'larda calisir.

```
Mayor → dispatch(bead-1) → polecat/chrome
      → dispatch(bead-2) → polecat/rust
      → dispatch(bead-3) → polecat/nitro
```

**2. Batch Slinging:**

Mayor, birden fazla bead'i siraya koyar ve polecatlere sirayla dagitir.
Bir polecat bir isi bitirip `gt done` calistirdiginda, kuyruktan bir
sonraki is otomatik olarak atanir. Bu, kaynak kullanimi ile verim arasinda
denge kurar.

**3. Bagimlilk-Tabanli Siralama:**

Bead bagimliliklari (`bd dep add`) araciligiyla, bir isin baska bir isin
tamamlanmasini beklemesi saglanir. Witness, bagimliliklari izler ve
bloke edilmis isleri yalnizca bagimliliklar kapandiginda dagitir.

### Ortaya Cikan Desen: Spekulatif Paralel (2025)

Ucuz ve pahali modeli paralel calistir. Ucuz modelin ciktisi kalite
kontrolunu gecerse, pahali modelin istegini iptal et ve ucuz sonucu
kullan. Gecmezse, pahali sonucu bekle. Maliyet icin gecikmeyi takas
eder — basarisiz durumlarda ikisi icin de odeme yapilir ama kolay
gorevlerde ucuz-model hizi elde edilir.

---

## Basarili Multi-Agent Uygulamalari

### Uretim Multi-Agent Sistemleri

| Sistem | Sirket | Mimari | Ozellik |
|--------|--------|--------|---------|
| **Claude Code** | Anthropic | Tek ajan + alt-ajanlar | Paralel dosya islemleri, kod arama, test calistirma |
| **Devin** | Cognition | Uzman ajan pipeline'i | Planlama, kodlama, test, deployment ajanlari |
| **Drafter** | Factory AI | Pipeline + kalite kapilari | Kurumsal yazilim gelistirme |
| **Replit Agent** | Replit | Cok adimli mimari | Planlama ajani → kodlama ajani → deployment |
| **Harvey AI** | Harvey | Beceri-tabanli routing | Alan-spesifik hukuk ajanlari |
| **Cursor Agent** | Cursor | Routing + alt-ajanlar | Gorev turune gore model secimi |
| **Gas Town** | Dahili | Paralel worker'lar + MQ | Polecat'ler, Witness, Refinery |

### Claude Code

Claude Code, uretim multi-agent sisteminin canli bir ornegi. Ana ajan,
paralel dosya islemleri, kod arama ve test calistirma icin alt-ajanlar
olusturur. `/dev` modu, bagimsiz gorevler icin 10'a kadar paralel
alt-ajan olusturabilir. Anthropic, Claude Code'un ic gelistirme
islerinin onemli bir kismini ele aldigini bildirmistir.

**Kaynak:** [docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code)

### Devin (Cognition)

Devin, planlama, kodlama, test ve deployment icin uzmanlasmis ajanlar
kullanan cok-ajanli bir kodlama sistemidir. Kendi tarayicisi, terminali
ve editoru olan sandbox ortaminda calisir. Model routing kullanir —
farkli alt gorev turleri icin farkli modeller.

**Kaynak:** [cognition.ai/devin](https://www.cognition.ai/devin)

### Harvey AI

Harvey, farkli hukuk uygulama alanlari (dava, sirketler, duzenleyici)
icin uzmanlasmis hukuk ajanlari dagitir. Yonlendirme katmani, hukuk
sorgularini uygun context ve arac erisimi ile alana ozgu ajanlara
yonlendirir. Am Law 100 firmalarinda uretimde. Kodlama disi bir alanda
beceri-tabanli routing gosterir.

**Kaynak:** [harvey.ai](https://www.harvey.ai)

### Gas Town (Bu Calisma Alani)

Gas Town, uretim cok-ajanli mimarisinin dogrudan ornegi:

- **Polecat'ler** (paralel isciler) izole worktree'lerde sorun basina olusturulur
- **Witness** isi koordine eder ve dogrular
- **Refinery** merge queue islemlerini yonetir
- **Iletisim:** Dolt-destekli beads (kalici) ve nudge'lar (gecici)
- **Formula-odakli is akislari** ajan basina yapilandirilmis kontrol listeleri saglar
- **Kendi kendini temizleme:** `gt done` sandbox'u yok eder ve oturumu kapatir

**Gosterdigi desenler:** Paralel spawn, beceri-tabanli routing (farkli
repo'lar icin farkli polecat'ler), kalici durum yonetimi, kendi kendini
temizleme yasam dongusu.

---

## Gas Town Mimarisi ile Karsilastirma

Gas Town'un multi-agent mimarisi, sektordeki diger yaklasimlarla nasil
karsilastirilir?

### Mimari Karsilastirma

| Ozellik | Gas Town | CrewAI | AutoGen | LangGraph |
|---------|----------|--------|---------|-----------|
| **Izolasyon** | Git worktree (tam izolasyon) | Paylasimli bellek | Actor mesajlasma | Paylasimli durum grafi |
| **Kalicilik** | Dolt (git-for-data) | Dosya/DB | Konusma gecmisi | Checkpoint |
| **Koordinasyon** | Witness + Refinery | Hiyerarsik surec | Grup sohbeti | Graf gecisleri |
| **Hata yonetimi** | Bisecting merge queue | Yeniden deneme | Actor hatasi | Checkpoint geri donusu |
| **Olcekleme** | Worktree basina polecat | Surec basina ajan | Actor runtime | Dugum calistirma |
| **Kendi kendini temizleme** | `gt done` (sandbox nuke) | Manuel | Manuel | Manuel |

### Gas Town'un Benzersiz Katkilari

1. **Worktree izolasyonu:** Her polecat, tam bir git worktree'de calisir.
   Bu, diger framework'lerin paylasimli bellek yaklasimindan temelden farklidir.
   Catisma riski sifir — her ajan kendi kopyasinda calisir.

2. **Bisecting merge queue:** Refinery, basarisiz MR'lari izole etmek
   icin ikili arama (bisect) kullanir. Bu, CI/CD pipeline'larindaki
   "yesilken birlestir" yaklasiminin otesindedir.

3. **Formula-odakli is akislari:** Her ajan icin yapilandirilmis kontrol
   listesi. Bu, diger framework'lerdeki serbest-form ajan talimatlarinin
   otesinde, tekrarlanabilir kalite saglar.

4. **Kendi kendini temizleme modeli:** Polecat'ler, isleri bittiginde
   kendilerini yok eder. Bu, kaynak sizintisini onler ve Gas Town'un
   surekli calismasini saglar.

---

## Sonuclar ve Oneriler

### Temel Trendler (2025-2026)

1. **Basitlik kazanir:** Anthropic'in "Building Effective Agents" makalesi
   (Aralik 2024), asiri karmasik cok-ajanli mimarilere karsi argumanlar
   sundu. Trend, iyi araclarla donatilmis tek ajanlara dogru, cok-ajanli
   yaklasim yalnizca gercekten gerektiginde (paralel calisma, uzman
   alanlar) kullaniliyor.

2. **Graf-tabanli orkestrasyon baskin:** LangGraph'in durum makinesi
   yaklasimi, karmasik is akislari icin fiili standart haline geldi.
   Google ADK benzer desenleri benimsedi.

3. **Model routing artik temel gereksinim:** Her ciddi uretim sistemi
   artik gorev turune ve maliyete gore modeller arasinda yonlendirme
   yapiyor. "Her sey icin tek model" yaklasimi sona erdi.

4. **Context protokolu standartlasmasi:** MCP (Model Context Protocol),
   ajanlar arasi arac/context paylasimi icin standart olarak ortaya
   cikiyor ve entegrasyon surtunmesini azaltiyor.

5. **Kendi kendini temizleyen ajanlar:** Uretim sistemleri, uzun
   omurlu ajan sureclerinden ziyade gecici, kendi kendini temizleyen
   ajan oturumlari (Gas Town'un polecat'leri gibi) kullaniyor.

### Gas Town Icin Oneriler

1. **Katmanli model routing:** Farkli polecat'ler icin farkli model
   katmanlari kullanilabilir. Basit dokumasyon gorevleri icin Haiku/Sonnet,
   karmasik kodlama icin Opus.

2. **Spekulatif paralel spawn:** Riskli gorevlerde ucuz ve pahali modeli
   paralel calistirarak gecikmeyi azaltip kaliteyi koruma.

3. **Batch slinging optimizasyonu:** Benzer gorevleri gruplandirarak
   tek polecat'e vererek sistem prompt token tekrarini azaltma.

4. **Semantik onbellekleme:** Tekrarlayan arastirma gorevlerinde onceki
   sonuclari onbellegine alarak API cagrilarini azaltma.

---

## Kaynaklar

- Anthropic. (2024). "Building Effective Agents." [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents)
- CrewAI. [github.com/crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)
- Microsoft AutoGen. [github.com/microsoft/autogen](https://github.com/microsoft/autogen)
- LangGraph. [github.com/langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
- OpenAI Swarm. [github.com/openai/swarm](https://github.com/openai/swarm)
- Google ADK. [github.com/google/adk-python](https://github.com/google/adk-python)
- Vercel AI Gateway. [vercel.com/docs/ai-gateway](https://vercel.com/docs/ai-gateway)
- Unify.ai — model router. [unify.ai](https://unify.ai)
- Martian — model routing. [withmartian.com](https://withmartian.com)
- Cognition Devin. [cognition.ai](https://www.cognition.ai/devin)
- Harvey AI. [harvey.ai](https://www.harvey.ai)
- Claude Code. [docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code)
