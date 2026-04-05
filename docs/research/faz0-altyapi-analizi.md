# Faz 0 Altyapi Analizi

## Amac ve Kapsam

Bu dokuman, mevcut AkOs kod tabaninin Faz 1 icin ne kadar hazir oldugunu degerlendirmek icin hazirlandi. Inceleme su alanlari kapsar:

- `package.json` ve temel runtime secimleri
- `tsconfig.json` ve TypeScript duzeni
- `src/` altindaki Next.js route ve UI yapisi
- Supabase semasi, migration'lar ve RLS yaklasimi
- Test altyapisi
- AI entegrasyonu
- Faz 1 hedefleri acisindan eksikler:
  - dokuman yonetimi
  - Google Drive
  - embedding / retrieval
  - BOQ import
  - PDF olusturma
  - markup

## Yonetici Ozeti

Mevcut uygulama, Faz 1'e dogru hizli ilerlemek icin uygun bir iskelet sunuyor; ancak bugunku haliyle urun omurgasi degil, daha cok UI + mock AI + ilk Supabase semasi seviyesinde. En buyuk avantaj, Next.js App Router ve Supabase RLS temellerinin erken kurulmus olmasi. En buyuk risk ise Faz 1'de gelecek belge, import, embedding ve teklif/markup akislari icin gereken veri modelinin henuz tanimlanmamis olmasi.

Kisa sonuc:

- Frontend iskeleti var, ama sayfalarin buyuk kismi placeholder.
- Chat ve AI akisi var, ama kalici veri, tenant baglami ve gercek tool icrasi yok.
- Supabase semasi operasyonel cekirdegi baslatmis, ama belge-merkezli Faz 1 icin yetersiz.
- Test altyapisi baslangic icin yeterli, ama sadece unit seviyesinde ve gercek sistem davranisini dogrulamiyor.
- Next.js App Router secimi dogru; ancak Faz 1 oncesi feature sinirlari, asenkron is akislari ve veri modeli netlestirilmezse sonradan maliyetli refaktor gerekir.

## 1. Mevcut Kod Tabaninin Durumu

### 1.1 Paket ve Runtime Secimleri

`package.json` mevcut stack'i net gosteriyor:

- `next: 16.2.2`
- `react: 19.2.4`
- `@supabase/ssr`, `@supabase/supabase-js`
- `ai`, `@ai-sdk/openai`, `@ai-sdk/react`
- `vitest`, `@testing-library/react`, `jsdom`

Degerlendirme:

- App Router tabanli modern bir stack secilmis.
- UI tarafi hafif ve hizli ilerlemeye uygun.
- AI SDK secimi Faz 1 icin mantikli; streaming, tool calling ve chat deneyimini hizli kurdurur.
- Ancak kullanici sorusunda Next.js 15 geciyor; repository fiilen Next.js 16 kullaniyor. App Router duzeni Next.js 15 ile uyumlu, fakat proje resmi olarak Next 15 hedefliyorsa surum standardizasyonu erken yapilmali. Faz 1 sirasinda framework downgrade/upgrade istenirse gereksiz maliyet dogar.

Karar:

- App Router yaklasimi korunmali.
- Faz 1 backlog'u acilmadan once "Next 15'te kalinacak mi, yoksa mevcut Next 16 ile devam mi edilecek?" karari verilmeli.

### 1.2 TypeScript ve Proje Ayarlari

`tsconfig.json` genel olarak saglam:

- `strict: true`
- `moduleResolution: bundler`
- `isolatedModules: true`
- `@/*` alias'i var

Artisi:

- Type safety kulturu icin dogru bir baslangic.
- App Router ve modern bundler ile uyumlu.

Eksisi:

- Domain tipleri, DB type generation, API contract tipleri ve shared schema katmani yok.
- Supabase icin generate edilmis tipler yok; bu, Faz 1'de migration sayisi arttikca tip kaymasi riski dogurur.

Oneri:

- `database.types.ts` uretilmeli.
- Zod schema + domain DTO ayrimi tanimlanmali.

## 2. `src/` Yapisi ve Next.js Route Mimarisi

### 2.1 Mevcut Route Organizasyonu

`src/app` altinda su yapi var:

- `(auth)` route group: `giris`, `kayit`
- `(dashboard)` route group: `dashboard`, `projeler`, `musteriler`, `boq`, `teklif`, `satinalma`, `taseron`, `hakedis`, `saha`, `ayarlar`, `chat`
- `api/chat/route.ts`
- root `page.tsx` -> `/chat` redirect

Bu yapi App Router mantigina uygun. Layout ayrimi da dogru kurulmus:

- auth ekranlari ayrik layout kullanıyor
- dashboard alaninda ortak sidebar var

### 2.2 Next.js 15 Route Yapisi Uygun mu?

Evet, prensipte uygun. Hatta mevcut yapi Next.js 15 App Router beklentileriyle uyumlu. Ama iki onemli not var:

1. Kod tabani fiilen Next.js 16 kullaniyor.
2. Route yapisi su an feature-based degil, ekran-based.

Bugunku haliyle sorun yok; ancak Faz 1'de su alanlar geldikce ekran-bazli duzen yetersiz kalacak:

- dokuman upload / parse / indexing
- Drive sync callback'leri
- import wizard'lari
- PDF generation endpoint'leri
- background job status endpoint'leri

Bu nedenle su yapi onerilir:

- `src/features/...` altinda domain bazli modulleme
- `app/...` altinda route'lar ince kalsin
- server actions / route handlers / use cases ayrilsin

Onerilen domain sinirlari:

- `features/projects`
- `features/documents`
- `features/drive`
- `features/boq`
- `features/proposals`
- `features/markup`
- `features/chat`
- `features/ai`

Sonuc:

- Route yapisi genel olarak dogru.
- Faz 1 oncesi route degil, domain modulasyonu iyilestirilmeli.

### 2.3 UI Katmani

UI tarafi agirlikla placeholder:

- dashboard kartlari statik
- BOQ, teklif vb. sayfalar bos durum sayfasi
- chat yan paneli ve sonuc paneli demo verilerle calisiyor

Bu kotu degil; cunku Faz 1 gereksinimleri UI'dan cok veri modeli ve servis sinirlarina bagli.

Ancak chat sayfasinda state tamamen client-side ve gecici:

- oturumlar memory'de
- mesajlar `useChat` state'inde
- session secince eski mesajlar siliniyor
- result panel statik

Bu yapi Faz 1'de yeterli olmayacak.

## 3. Supabase Altyapisi ve Sema Analizi

### 3.1 Mevcut Sema

Ilk migration'da su tablolar var:

- `users`
- `projects`
- `customers`
- `boq_items`
- `proposals`
- `purchase_orders`
- `subcontracts`
- `progress_payments`
- `site_reports`
- `chat_sessions`
- `chat_messages`

Bu tablolar, is insaati/proje yonetimi cekirdegi icin mantikli bir baslangic. Fakat Faz 1 hedeflerinin cogu bu semanin disinda kaliyor.

### 3.2 Guclu Yanlar

- Tum tablolarda `tenant_id` var.
- `updated_at` trigger standardize edilmis.
- Cekirdek operasyonel kavramlar tanimlanmis.
- RLS tum tablolarda etkin.

### 3.3 Kritik Sorunlar

#### 3.3.1 `tenant_id` modeli eksik

Tum tablolarda `tenant_id` var; fakat `tenants` tablosu yok. Bu su sorunlari dogurur:

- tenant metadata saklanamaz
- tenant lifecycle yonetilemez
- foreign key ile tenant butunlugu kurulamaz
- enterprise/organizasyon bazli ayarlar tutarli sekilde tasarlanamaz

Faz 1'de belge, Drive baglantisi, embedding ve artifact'ler tenant bazli calisacagi icin bu bosluk buyur.

#### 3.3.2 `users` tablosu ile Supabase Auth iliskisi eksik

Mevcut auth akisi `supabase.auth.signUp/signInWithPassword` kullaniyor; ancak:

- `public.users` kaydi otomatik uretilmiyor
- `tenant_id` claim set edilmiyor
- RLS `auth.jwt().app_metadata.tenant_id` bekliyor

Bu, pratikte su anlama gelir:

- login/signup calisabilir
- ama tenant baglamli veri erisimi tutarli sekilde calismaz
- RLS politikasi ile uygulama auth akisi ayni modeli paylasmiyor

Bu, Faz 1 oncesi cozulmesi gereken en kritik altyapi kararidir.

#### 3.3.3 Tenant butunlugu veri modelinde garanti edilmiyor

Tablolarda `tenant_id` var ama iliskilerde tenant consistency check yok.

Ornek:

- `boq_items.project_id` bir projeye bagli
- ama `boq_items.tenant_id = projects.tenant_id` zorunlulugu DB seviyesinde garanti edilmiyor

Bu tip capraz-tenant veri tutarsizliklari import ve arka plan islerinde pahali buglara yol acar.

#### 3.3.4 Belge / dosya / artifact modeli yok

Faz 1 icin gerekli olan su kavramlar semada bulunmuyor:

- dokuman kaydi
- dosya versiyonu
- storage key / bucket metadata
- parse sonucu
- chunk'lar
- embedding'ler
- PDF export artifact'leri
- Google Drive baglantisi ve senkron kayitlari
- import job / import row / import mapping tablolari

Bugunku schema Faz 1'in belge-merkezli kismini desteklemiyor.

### 3.4 RLS Yaklasimi

RLS mantigi dogru yone gidiyor: tenant claim tabanli izolasyon.

Ancak eksikler:

- signup sirasinda claim set edilmiyor
- service role ile calisacak background sync/import isleri icin model yok
- dokuman, chunk, embedding, artifact gibi yeni tablolar icin RLS stratejisi simdiden tanimlanmamis

Oneri:

- `tenants` tablosu eklenmeli
- `profiles` veya `tenant_memberships` tablosu tanimlanmali
- RLS sadece `tenant_id` degil, uyelik/rol mantigi ile birlikte yeniden tasarlanmali

### 3.5 Faz 1 Icın Gerekli Sema Genislemeleri

Asagidaki alanlarda schema degisikligi gerekecek. Bu degisikliklerin cogu "evet, gerekli" seviyesinde zorunlu.

#### Dokuman yonetimi

En az su tablolar gerekir:

- `documents`
- `document_versions`
- `document_chunks`
- `document_links` veya `document_relations`
- `document_processing_jobs`

Asgari alanlar:

- `tenant_id`
- `project_id` veya iliskili domain baglami
- `source_type` (`upload`, `google_drive`, `generated`, `email`, vb.)
- `mime_type`
- `storage_path`
- `checksum`
- `version_no`
- `processing_status`
- `parsed_text`
- `metadata jsonb`

#### Google Drive

En az su kayitlar gerekir:

- `external_connections`
- `google_drive_files`
- `sync_jobs`
- `oauth_state` veya guvenli token referans modeli

Not:

- Access token'lari dogrudan bu tabloda tutmak yerine Supabase Vault veya ayrik gizli yonetim katmani tercih edilmeli.

#### Embedding / retrieval

En az su katman gerekir:

- `document_chunks`
- `document_embeddings`

Muhtemel alanlar:

- `embedding_model`
- `embedding_dimensions`
- `chunk_index`
- `chunk_text`
- `token_count`
- `vector`

Burada `pgvector` kullanimi bugunden kararlastirilmali. Sonradan disaridan vector DB'ye tasinmak daha maliyetlidir ama mumkundur; asil maliyet, canonical chunk identity modelini gec tanimlamaktir.

#### BOQ import

Direkt `boq_items` tablosuna yazmak yetersiz olur. Staging gerekir:

- `import_jobs`
- `import_files`
- `boq_import_rows`
- `boq_import_mappings`
- `boq_item_revisions` veya `boq_snapshots`

Sebep:

- farkli Excel/PDF formatlari normalize edilmeli
- kolon esleme izlenmeli
- hata/uyari raporu tutulmali
- tekrar import senaryolari desteklenmeli

#### PDF olusturma

PDF sadece "olustur ve indir" seviyesi degil; artifact olarak saklanmali:

- `generated_documents`
- `document_exports`
- `export_templates`

Gereken bilgiler:

- hangi veriden uretildi
- hangi template ile uretildi
- hangi versiyon oldugu
- storage path
- tekrar uretilebilirlik bilgisi

#### Markup

Markup alaninda mevcut schema cok zayif. `proposals` sadece header seviyesinde.

Faz 1 icin muhtemel ihtiyac:

- `proposal_items`
- `cost_items`
- `pricing_rules`
- `markup_profiles`
- `markup_rule_sets`

En kritik karar:

- markup satir bazli mi olacak
- kategori bazli mi olacak
- proje bazli override desteklenecek mi
- BOQ -> teklif donusumu bire bir trace edilecek mi

Bu karar gec kalirsa teklif ve BOQ katmani bastan yazilabilir.

## 4. AI Entegrasyonu Analizi

### 4.1 Mevcut Durum

AI entegrasyonu su an tek route uzerinden yurutuluyor:

- `src/app/api/chat/route.ts`
- model: `gpt-4o-mini`
- iki tool: `createProject`, `getDashboard`

Chat UI ise `@ai-sdk/react` ile kurulmus.

### 4.2 Guclu Yanlar

- AI SDK secimi dogru.
- Streaming response kullanimi iyi bir baslangic.
- Tool-calling mantigi Faz 1 icin genislemeye uygun.
- Turkce sistem prompt'u urun amaciyla uyumlu.

### 4.3 Kritik Eksikler

#### 4.3.1 Tool'lar gercek sisteme bagli degil

`createProject` ve `getDashboard` sadece mock sonuc donuyor. Supabase'e yazma/okuma yok.

#### 4.3.2 Tool tanimi iki yerde tekrar ediyor

Tool tanimlari hem `src/app/api/chat/route.ts` icinde hem `src/lib/ai/tools/*` altinda var. Bu duplication ileride sorun cikarir:

- schema kaymasi
- test edilen davranis ile calisan davranisin farkli olmasi
- yeni tool eklerken tutarsizlik

Tek registry olmali.

#### 4.3.3 Tenant / user / project context yok

AI route:

- auth kontrol etmiyor
- aktif tenant'i resolve etmiyor
- proje baglami gecmiyor
- audit log tutmuyor

Faz 1'de belge retrieval, Drive, teklif ve BOQ sorulari tenant/project baglamsiz calisamaz.

#### 4.3.4 Kalici sohbet modeli uygulanmamis

Schema'da `chat_sessions` ve `chat_messages` var ama UI/API bunlari kullanmiyor.

Bu da su anlama geliyor:

- chat hafizasi kalici degil
- retrieval cache veya tool sonuc kayitlari tutulmuyor
- AI sonucu ile domain artifact baglantisi kurulamaz

#### 4.3.5 Retrieval / embedding yok

Faz 1'de dokuman yonetimi ve Drive gelecekse retrieval zorunluya yakin. Bugunku AI katmani saf tool-calling demosu seviyesinde.

### 4.4 AI Katmani Icin Onerilen Mimari

- `features/ai/server/chat-orchestrator.ts`
- `features/ai/server/tool-registry.ts`
- `features/ai/server/context-resolver.ts`
- `features/ai/server/retrieval.ts`
- `features/ai/server/message-store.ts`

Prensipler:

- model secimi merkezi olsun
- tool registry tek kaynaktan gelsin
- her tool tenant/project/user context alsin
- chat mesajlari kalici kaydedilsin
- retrieval pipeline bagimsiz modul olsun

## 5. Test Altyapisi Analizi

### 5.1 Mevcut Durum

Vitest kurulmus ve calisiyor. Bu inceleme sirasinda `npm test` basariyla calisti:

- `3` test dosyasi
- `14` test
- hepsi gecti

Mevcut testler su alanlarda:

- tool metadata
- schema validation
- mock return shape

### 5.2 Guclu Yanlar

- Test calisan durumda.
- Kurulum hafif ve hizli.
- Saf is mantigi icin iyi bir baslangic.

### 5.3 Eksikler

- Route handler testi yok
- Supabase entegrasyon testi yok
- RLS dogrulama testi yok
- auth akisi testi yok
- UI etkileşim testi yok
- e2e testi yok
- import pipeline testi yok
- PDF generation testi yok
- AI tool contract testi yok
- CI pipeline gorunmuyor

### 5.4 Faz 1 Icin Onerilen Test Stratejisi

Test stratejisi 4 katmanli olmali:

#### 1. Unit test

Kapsam:

- pure formatter'lar
- parsers
- BOQ normalization
- markup hesap motoru
- prompt builder / tool schema mantigi

Arac:

- Vitest

#### 2. Integration test

Kapsam:

- route handlers
- server actions
- Supabase repository katmani
- import pipeline
- PDF generation servisleri

Arac:

- Vitest + test DB
- mumkunse local Supabase veya izole Postgres

#### 3. RLS / SQL testleri

Kapsam:

- tenant izolasyonu
- membership / role policy'leri
- import ve document tablolarinin yetki kontrolu

Arac:

- SQL smoke test
- pgTAP tercih edilebilir

#### 4. E2E test

Kapsam:

- login
- proje olusturma
- dokuman upload
- BOQ import wizard
- teklif olusturma
- AI chat ile dokumandan soru sorma

Arac:

- Playwright

Karar:

- Faz 1 baslamadan once en azindan Playwright ve integration test altyapisi backlog'a alinmali.

## 6. Faz 1 Eksiklerinin Alan Bazli Degerlendirmesi

### 6.1 Dokuman Yonetimi

Mevcut durum:

- yok

Gerekli:

- file upload
- storage organizasyonu
- metadata modeli
- versiyonlama
- parse pipeline
- OCR/PDF/text extraction
- dokuman ile proje/teklif/BOQ iliskileri

Risk:

- dokumanlari sadece storage'da tutup DB'de zayif modellemek, retrieval ve audit tarafini sonradan pahali hale getirir.

### 6.2 Google Drive

Mevcut durum:

- yok

Gerekli:

- OAuth baglantisi
- file sync stratejisi
- external file identity modeli
- webhook/polling karari
- duplicate / versiyon senaryolari

Risk:

- Drive dosyasi "dokumanin kendisi mi", yoksa "dokumana bagli external source mu" karari simdi verilmezse belge modeli ikiye bolunur.

### 6.3 Embedding

Mevcut durum:

- yok

Gerekli:

- chunking stratejisi
- vector storage
- embedding model secimi
- re-embedding politikasi
- retrieval scope: tenant / proje / belge / oturum

Risk:

- chunk kimligi ve source-of-truth modeli gec belirlenirse yeniden indexleme ve veri migrasyonu maliyetli olur.

### 6.4 BOQ Import

Mevcut durum:

- sadece `boq_items` tablosu var
- import akis modeli yok

Gerekli:

- staging
- mapping
- validation
- duplicate handling
- source file traceability

Risk:

- importu direkt canonical tablolara yazmak, hatali veri temizligini ve tekrar importu zorlastirir.

### 6.5 PDF Olusturma

Mevcut durum:

- yok

Gerekli:

- template sistemi
- render servisi
- artifact storage
- versiyonlama
- tekrar uretilebilirlik

Risk:

- HTML-to-PDF ciktisini gecici response olarak ele almak, resmi teklif/hakediş ciktilarinda izlenebilirlik sorununa yol acar.

### 6.6 Markup

Mevcut durum:

- teklif basligi var
- satir/hesap/rule modeli yok

Gerekli:

- maliyet tabani
- markup kural setleri
- kategori / satir / proje override mantigi
- BOQ -> teklif izlenebilirligi

Risk:

- markup mantigi UI veya API icinde daginik kodlanirsa sonra kuralsal motor haline getirmek pahali olur.

## 7. Simdi Karar Verilmezse Sonradan Maliyetli Olacak Konular

Bu bolum en kritik karar listesidir.

### 7.1 Tenant ve kullanici modeli

Karar verilmesi gereken:

- `tenants` tablosu olacak mi
- `users` yerine `profiles + tenant_memberships` mi kullanilacak
- roller tenant bazli mi olacak

Neden pahali:

- RLS, auth, tum yeni tablolar ve AI yetkilendirmesi buna bagli.

### 7.2 Dokumanin canonical kimligi

Karar verilmesi gereken:

- bir dokumanin ana kimligi nedir
- upload edilen dosya ile Drive dosyasi ayni `document` altinda mi tutulacak
- version mantigi nasil olacak

Neden pahali:

- parse, sync, retrieval, export ve audit zincirinin hepsi buna bagli.

### 7.3 Vector stratejisi

Karar verilmesi gereken:

- `pgvector` mi
- harici vector DB mi
- chunk boyutu ve metadata standardi ne olacak

Neden pahali:

- retrieval kalitesi ve re-index operasyonu buna bagli.

### 7.4 BOQ canonical modeli

Karar verilmesi gereken:

- import sonrasi tek dogru tablo `boq_items` mi
- snapshot/revision tutulacak mi
- satirlarin kaynagi izlenecek mi

Neden pahali:

- teklif ve markup motori BOQ modeline yaslanacak.

### 7.5 Teklif / markup hesap modeli

Karar verilmesi gereken:

- teklif satirlari nasil tutulacak
- markup rule engine DB'de mi kodda mi olacak
- maliyet, satis ve marj ayri alanlar mi olacak

Neden pahali:

- bu karar verilmeden teklif/PDF/AI tavsiye katmani saglam kurulamaz.

### 7.6 Asenkron is modeli

Karar verilmesi gereken:

- import, parse, embedding, PDF generation ve Drive sync isleri nasil calisacak
- queue/job tablosu olacak mi
- retry ve failure kaydi nasil tutulacak

Neden pahali:

- senkron route'lara yuklenirse sonra sistem parcali sekilde yeniden yazilir.

### 7.7 Artifact ve storage stratejisi

Karar verilmesi gereken:

- Supabase Storage yeterli mi
- bucket ayrimi nasil olacak
- generated artifact'ler version'li mi tutulacak

Neden pahali:

- belge, export, PDF ve import kaynaklari ayni depolama modeline oturacak.

## 8. Onerilen Faz 1 Hazirlik Plani

Faz 1 baslamadan once su teknik isler yapilmali:

1. Tenant + auth + membership modelini netlestir.
2. Supabase schema v2 tasarla:
   - `tenants`
   - `profiles` / `memberships`
   - `documents`
   - `document_versions`
   - `document_chunks`
   - `import_jobs`
   - `boq_import_rows`
   - `proposal_items`
   - `markup_profiles`
   - `generated_documents`
3. AI tool registry'yi tekilleştir.
4. Chat persistence'i gercek tabloya bagla.
5. `pgvector` ve chunking standardini karar altina al.
6. Import ve document processing icin job modeli kur.
7. Test stratejisini unit + integration + RLS + e2e olarak genislet.

## 9. Nihai Sonuc

AkOs'un mevcut hali, Faz 1'e baslamak icin uygun bir prototip zemini sunuyor; fakat Faz 1 kapsamindaki belge, import, retrieval ve teklif/markup ihtiyaclari icin veri modeli ve backend sinirlari henuz hazir degil.

Net cevaplar:

- Next.js 15 App Router mantigi acisindan route yapisi uygun.
- Ancak proje fiilen Next.js 16 uzerinde; surum karari netlestirilmeli.
- Supabase semasi Faz 1 icin kesinlikle degisiklik gerektirir.
- Test stratejisi bugunku haliyle yetersiz; sadece unit seviyesinde.
- En kritik erken kararlar: tenant modeli, dokuman canonical modeli, vector stratejisi, BOQ canonical modeli, teklif/markup hesap modeli ve asenkron is altyapisi.

Bu kararlar Faz 1 gelistirmesi baslamadan alinirse ilerleme hizlanir. Alinmazsa, en buyuk refaktor maliyeti UI tarafinda degil; veri modeli, RLS, import pipeline ve AI retrieval katmaninda olusur.
