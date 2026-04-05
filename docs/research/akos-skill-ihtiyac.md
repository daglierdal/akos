# AkOs Skill Ihtiyaci

> Tarih: 2026-04-05
> Kaynaklar: `CLAUDE.md`, `.claude/commands/done.md`, `.claude/commands/handoff.md`, `.claude/commands/review.md`, `src/app/api/chat/route.ts`, `src/lib/ai/tools/*`

## Ozet

Bu rig'de su an tanimli 3 komut var:

- `done`: GT merge queue ve bead kapanis akisi
- `handoff`: oturum devri
- `review`: diff tabanli kod inceleme

Bunlar faydali ama **AkOs'a ozel degil**. Yani rig'in operasyonunu tanimliyorlar, urunun kendisini degil. `CLAUDE.md` ise AkOs'un AI-first, chat-first ve tool-driven oldugunu net tarif ediyor; fakat bunu gunluk gelistirme isine ceviren skill katmani henuz yok.

Sonuc: AkOs icin rig-level skill'ler gerekli. Ozellikle chat-first ERP akislari, AI tool tasarimi, domain modelleme ve sohbetten eyleme gecis kurallari icin.

## Mevcut Durumdan Cikan Bosluklar

`CLAUDE.md` ve canli kod ayni seyi soyluyor:

- Uygulama chat-first bir proje yonetim sistemi
- AI tool'lar `src/lib/ai/tools/` altinda tanimlaniyor
- Tool'lar Zod ile dogrulaniyor
- Sistem simdilik sadece `createProject` ve `getDashboard` yetenegine sahip
- `src/app/api/chat/route.ts` icinde tool tanimlari tekrar yazilmis; yani tool registry ile chat route arasinda cift kaynak riski var

Bu tablo su ihtiyaci doguruyor:

1. Domain ozguluk gerekiyor. AkOs siradan CRUD SaaS degil; insaat ve proje yonetimi terimleri, varliklari ve akislari skill seviyesinde sabitlenmeli.
2. Tool tasarim standardi gerekiyor. Ayni tool'un hem registry'de hem route'ta tanimlanmasi ileride drift yaratir.
3. Chat UX kurallari gerekiyor. Hangi is tamamen sohbetten cozulur, hangi noktada artifact/panel/devam sorusu gerekir; bunun tekrar tekrar dusunulmemesi lazim.
4. Planning ve implementation ayrimi gerekiyor. Mayor ile Polecat ayni skill setini tasimak zorunda degil.

## AkOs Icin Gerekli Skill'ler

Asagidaki skill seti rig-level icin mantikli gorunuyor.

### 1. `akos-domain-modeling`

Amac:
- AkOs'un cekirdek varliklarini ve iliskilerini standartlastirmak

Kapsam:
- Proje, musteri, teklif, gorev, aktivite, dashboard ozeti, chat artifact
- Insaat/proje yonetimi terim sozlugu
- Turkce alan adlari ile kod seviyesindeki adlandirma kurallari

Neden lazim:
- AI-first urunlerde modelleme dili dagilinca hem prompt hem tool hem UI bozulur.

### 2. `akos-tool-design`

Amac:
- Yeni AI tool ekleme ve mevcut tool'lari evrimlestirme icin standart workflow

Kapsam:
- Ne zaman yeni tool acilir, ne zaman mevcut tool genisletilir
- Zod schema kurallari
- `description` yazim kalibi
- `execute` donus yapisi
- Idempotency, hata sekilleri, audit alanlari
- Route ile tool registry arasinda tek kaynak ilkesi

Neden lazim:
- AkOs'un urun cekirdegi tool-driven. Skill olmadan her polecat farkli tool tasarlar.

### 3. `akos-chat-to-tool-routing`

Amac:
- Kullanici niyetini sohbetten tool cagrilarina donusturme kurallarini standardlastirmak

Kapsam:
- Hangi istemler direkt tool'a gider
- Hangi durumda eksik bilgi sorulur
- Hangi durumda sadece bilgilendirici cevap donulur
- Tool sonucu sohbet karti vs detay paneli olarak nasil sunulur
- Turkce/Ingce dil davranisi

Neden lazim:
- AkOs'un ana UX'i bu. Bu kararlar prompt icinde daginik kalmamali.

### 4. `akos-chat-first-ux`

Amac:
- Chat-first + progressive disclosure urun kararlarini tekrar kullanilabilir hale getirmek

Kapsam:
- Sohbet, sag panel, dashboard, artifact gecisleri
- Basit is vs karmasik is ayrimi
- Mobil/desktop davranis ilkeleri
- Kullaniciya gereksiz form gosterilmeme prensibi

Neden lazim:
- `docs/research/chat-first-erp-ux.md` icindeki arastirma, uygulanabilir bir skill'e indirgenmeli.

### 5. `akos-supabase-boundary`

Amac:
- AI tool'lar ile Supabase arasindaki siniri netlestirmek

Kapsam:
- Server/client sorumluluklari
- Auth/tenant sinirlari
- SSR ve API route erisim kurallari
- SQL/RLS etkileri
- Mock veri -> gercek veri gecis checklist'i

Neden lazim:
- Kodda su an TODO seviyesinde duran kisimlar en hizli burada karmasaya donusur.

### 6. `akos-feature-slice-delivery`

Amac:
- AkOs ozelliklerini dikey dilimler halinde gelistirme

Kapsam:
- Ornek slice: "kullanicidan proje olustur istegi al -> tool cagir -> Supabase'e yaz -> sohbette sonucu goster -> dashboard'a yansit"
- Her slice icin beklenen dosyalar, testler, kabul kriterleri

Neden lazim:
- AI-first urunlerde sadece UI veya sadece backend yapmak yetmez; ucunu birlikte baglamak gerekir.

### 7. `akos-review-lens`

Amac:
- Kod review'lerde AkOs'a ozel riskleri onceliklendirmek

Kapsam:
- Prompt/tool drift
- Tool schema ile UI form beklentisi uyumsuzlugu
- Mock data'nin production davranisi gibi sunulmasi
- Turkce metin ve domain terimi bozulmalari
- Chat route icinde artan business logic

Neden lazim:
- Mevcut `/review` genel amacli. AkOs icin alan-ozel bir inceleme lens'i faydali olur.

## Mayor vs Polecat Skill Farki Var Mi?

Evet, var. Ama bu fark "tamamen ayri skill evrenleri" degil; **ortak cekirdek + role-specific ekler** seklinde olmali.

## Ortak Skill'ler

Hem Mayor hem Polecat kullanmali:

- `akos-domain-modeling`
- `akos-tool-design`
- `akos-chat-to-tool-routing`
- `akos-chat-first-ux`

Gerekce:
- Mayor dogru isi tanimlayabilmek icin bunlari bilmeli.
- Polecat da isi dogru uygulayabilmek icin ayni urun modelini tasimali.

## Mayor'a Ozel Skill'ler

### `akos-discovery-and-slicing`

Amac:
- Belirsiz urun istegini uygulanabilir bead'lere bolmek

Icerik:
- Kullanici niyetini domain varliklarina cevirme
- Eksik gereksinim listesi cikarma
- "tek bead" vs "birden fazla polecat" karari
- Onceliklendirme ve risk yazimi

### `akos-roadmap-and-sequencing`

Amac:
- Tool-first urun gelisim sirasini belirlemek

Icerik:
- Once domain/tool, sonra UI polish
- Mock -> Supabase -> test -> UX iyilestirme akisi
- Bagimlilik sirasi

Mayor icin odak:
- Problem framing
- Scope kontrolu
- Dogru dilimleme
- Dogru agente dogru is atama

## Polecat'e Ozel Skill'ler

### `akos-implementation-playbook`

Amac:
- AkOs stack'i icinde degisiklik yaparken izlenecek teknik yol

Icerik:
- Next.js App Router kaliplari
- shadcn/ui ile uyumlu bilesen gelistirme
- AI SDK route uygulama prensipleri
- Tool registry kullanimi
- Vitest ve lint beklentileri

### `akos-tool-implementation`

Amac:
- Yeni tool'u guvenli ve tekrarli sekilde kodlamak

Icerik:
- Schema, result type, execute, test
- Mock implementasyondan kalici veri katmanina gecis
- Tool naming ve dosya yerlestirme

### `akos-chat-surface-integration`

Amac:
- Tool sonucunu kullaniciya chat + dashboard + panel yuzeylerinde tutarli yansitmak

Icerik:
- UI state akisi
- optimistic vs confirmed result
- hata durumu ve fallback metinleri

Polecat icin odak:
- Uretim kodu
- Entegrasyon
- Test ve verification

## Mayor (Claude) vs Polecat (Codex) Farki

Pratikte fark su:

- **Mayor (Claude)** daha cok belirsizligi azaltan, isi sekillendiren ve bead'e donusturen skill'lere ihtiyac duyar.
- **Polecat (Codex)** daha cok uygulama icinde tutarli degisiklik yapan, test eden ve teslim eden skill'lere ihtiyac duyar.

Yani fark vardir; fakat urun mantigi ayri olmamalidir. Mayor ile Polecat farkli "gercekler" tasimamali. Fark, ayni urun bilgisinin hangi amacla paketlendigi seviyesindedir:

- Mayor: analiz, parcala, sirala, gorevlendir
- Polecat: uygula, bagla, test et, teslim et

## Onerilen Ilk Paket

Ilk asamada asagidaki 5 skill en yuksek getiriyi saglar:

1. `akos-domain-modeling`
2. `akos-tool-design`
3. `akos-chat-to-tool-routing`
4. `akos-implementation-playbook`
5. `akos-discovery-and-slicing`

Bu besli kuruldugunda:

- Mayor daha iyi bead yazar
- Polecat daha tutarli implement eder
- Tool sprawl azalir
- Chat-first kararlar prompt icinde daginik kalmaz

## Son Karar

AkOs stack'ine ozel skill ihtiyaci vardir ve bu ihtiyac mevcut 3 komutla karsilanmiyor. Mevcut komutlar rig operasyonu icin yeterli, fakat urun gelistirme semantigi icin yetersiz.

Mayor vs Polecat skill farki da vardir:

- Ortak cekirdekte ayni AkOs urun bilgisini paylasmalilar
- Mayor skill'leri planlama, triage ve slicing agirlikli olmali
- Polecat skill'leri implementasyon, entegrasyon ve verification agirlikli olmali

En dogru yapi: ortak AkOs cekirdek skill'leri + role-specific ust skill'ler.
