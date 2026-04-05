# Faz 1 Kutuphane Karsilastirma

> AkOs icin Faz 1 teknoloji secim notlari. Odak: PDF, Excel, Google Drive, PDF uretimi, canvas/annotation, embedding ve test katmani.

**Tarih:** 2026-04-05  
**Proje baglami:** Bu repo su anda Next.js 16 + React 19 + Supabase kullaniyor. Asagidaki degerlendirme Next.js 15 uyumlulugunu hedefler; onerilerin tamami Next.js 16 ile de uyumludur.  
**Not:** "Bundle size" kolonu npm registry `dist.unpackedSize` verisini kullanir. Bu deger tarayiciya giden gercek gzip/brotli bundle boyutu degildir, fakat kutuphanelerin goreli agirligini gormek icin yeterlidir.

---

## Kisa Sonuc

Faz 1 icin en guclu secim seti:

- **PDF parsing:** `unpdf`
- **Excel / spreadsheet import-export:** `SheetJS`
- **Google Drive API:** `googleapis` + OAuth2, sadece server-side
- **PDF generation:** `@react-pdf/renderer`
- **Canvas / annotation:** `konva` (React tarafinda `react-konva` ile)
- **Embedding / vector storage:** `pgvector` (Supabase Postgres icinde)
- **Test stratejisi:** `Vitest` + `Playwright` birlikte

Bu set, Next.js App Router + Supabase mimarisinde en az surtunmeyle ilerler. Ozellikle Faz 1'de gereksiz servis cogaltmamak icin vector katmanini Supabase icinde tutmak ve dosya islemlerini Node runtime tarafinda yapmak daha dogru.

---

## 1. PDF Parsing

### Karsilastirma

| Kutuphane | Ana guc | Bundle size | Lisans | Next.js 15 | Turkce destek | Supabase entegrasyonu | Not |
|-----------|----------|-------------|--------|------------|---------------|------------------------|-----|
| `unpdf` | Serverless/edge uyumlu modern extraction | 1.74 MB | MIT | Cok iyi | Iyi* | Cok iyi | Faz 1 onerisi |
| `pdfjs-dist` | En dusuk seviye kontrol, resmi PDF.js dagitimi | 38.92 MB | Apache-2.0 | Orta | Iyi* | Orta | Worker ve setup maliyeti yuksek |
| `pdf-parse` | Hazir text extraction API | 20.27 MB | Apache-2.0 | Orta | Iyi* | Iyi | `unpdf` kadar modern/serverless degil |

\* Turkce destek notu: Dijital PDF'lerde Turkce karakterler genelde sorunsuz okunur. Taranmis PDF veya bozuk font mapping durumlarinda bu kutuphanelerin hicbiri OCR yerine gecmez.

### Degerlendirme

`unpdf`, Faz 1 icin en dengeli secim. README'sinde Node.js, browser ve serverless ortamlar icin tasarlandigi, hatta edge odakli PDF.js bundling yaptigi acikca belirtiliyor. Bu, Next.js App Router'da dosya isleme mantigini gerektiginde Node'da, gerektiginde daha hafif serverless is akislarinda kullanabilmeyi kolaylastiriyor.

`pdfjs-dist` teknik olarak en guclu taban kutuphane ama Faz 1 icin fazla dusuk seviye. Worker yonetimi, import ayarlari ve agir paket yapisi nedeniyle yalnizca dogrudan PDF.js API'sine ihtiyac varsa mantikli.

`pdf-parse` pratik ama `unpdf` kadar edge/serverless merkezli degil. Bugunku Next.js + serverless akista `unpdf` daha temiz secim.

### Karar

**Secim: `unpdf`**

Sebep:

- Daha hafif
- Serverless/edge dostu
- PDF.js gucunu korurken daha ergonomik API sunuyor
- Supabase Storage'dan alinan PDF dosyalarini parse etmek icin uygun

---

## 2. Excel

### Karsilastirma

| Kutuphane | Kapsam | Bundle size | Lisans | Next.js 15 | Turkce destek | Supabase entegrasyonu | Not |
|-----------|--------|-------------|--------|------------|---------------|------------------------|-----|
| `xlsx` (SheetJS) | XLSX/XLS/CSV okuma-yazma, en genis format destegi | 7.15 MB | Apache-2.0 | Cok iyi | Iyi | Cok iyi | Faz 1 onerisi |
| `exceljs` | Ozellikle stil, workbook manipulasyonu ve rapor uretimi | 20.81 MB | MIT | Iyi (Node agirlikli) | Iyi | Iyi | Export odakli zengin senaryolar icin guclu |
| `papaparse` | Sadece CSV | 0.25 MB | MIT | Cok iyi | Iyi | Cok iyi | Excel alternatifi degil, CSV yardimcisi |

### Degerlendirme

Burada asil karsilastirma `SheetJS` vs `ExcelJS`. `PapaParse` ayni kategoriye tam olarak girmiyor; CSV icin cok iyi ama `.xlsx` icin uygun degil.

`SheetJS`, Faz 1 icin daha dogru merkez kutuphane. Sebep, dosya format kapsami ve import/export esnekligi. Kullanici yukledigi `.xlsx`, `.xls`, `.csv` dosyalarini tek kutuphane uzerinden normalize etmek daha kolay.

`ExcelJS`, rapor uretimi ve format/stil kontrollu workbook olusturma icin daha iyi. Ancak import-first bir Faz 1 urununde fazla agir kalir.

`PapaParse`, buna ragmen tamamen dislanmamali. Buyuk CSV import akislari olursa ikincil yardimci kutuphane olarak degerli. Ama ana Excel secimi olarak alinmamali.

### Karar

**Secim: `SheetJS`**

Ikinci not:

- Sadece buyuk CSV import ekranlari cikarsa `PapaParse` ikincil yardimci olarak eklenebilir.
- Formatli, kurumsal rapor/PDF-oncesi Excel export ihtiyaci buyurse `ExcelJS` sonradan eklenebilir.

---

## 3. Google Drive API

### Karsilastirma

Bu baslikta dogrudan bire bir birden fazla kutuphane yok; asil secim "Google Drive erisimi nasil kurulacak?" sorusu. Faz 1 icin pratik secim:

- `googleapis` ana istemci
- OAuth2 web server flow
- Tum Drive islemleri sadece server-side

| Secenek | Bundle size | Lisans | Next.js 15 | Turkce destek | Supabase entegrasyonu | Not |
|---------|-------------|--------|------------|---------------|------------------------|-----|
| `googleapis` | 190.40 MB | Apache-2.0 | Iyi, ama sadece Node runtime | Iyi | Iyi | Tum Google API'leri tek SDK |
| `@googleapis/oauth2` | 0.11 MB | Apache-2.0 | Iyi, ama tek basina yetmez | Iyi | Orta | Sadece dar kapsamli parcali kullanim |

### Degerlendirme

`googleapis` agir bir paket, fakat Drive entegrasyonunda bakim maliyeti dusuk. OAuth2, Drive dosya listeleme, export, metadata ve upload/download gibi akislari ayni ekosistemden yonetir.

Bu kutuphane **Edge runtime icin uygun degil**. Node runtime tarafinda Route Handler kullanilmalidir:

- `/api/google/auth/start`
- `/api/google/auth/callback`
- `/api/google/drive/import`

Google token'lari Supabase'de sifreli sekilde saklanabilir:

- `google_accounts`
- `google_oauth_tokens`

Burada access token'lari kisa omurlu; refresh token saklama politikasini ayri dusunmek gerekir.

### Karar

**Secim: `googleapis` + OAuth2 web server flow**

Sebep:

- Faz 1 icin en hizli ve en risksiz yol
- Resmi SDK
- Drive API genisledikce yeni servisler eklemek kolay
- Supabase tarafinda user-based token mapping basit

---

## 4. PDF Generation

### Karsilastirma

| Kutuphane | Ana guc | Bundle size | Lisans | Next.js 15 | Turkce destek | Supabase entegrasyonu | Not |
|-----------|----------|-------------|--------|------------|---------------|------------------------|-----|
| `@react-pdf/renderer` | React component modeliyle PDF uretimi | 0.25 MB | MIT | Cok iyi | Iyi** | Cok iyi | Faz 1 onerisi |
| `jspdf` | Hizli client-side basit PDF | 28.79 MB | MIT | Orta | Orta** | Orta | Layout karmasiklastikca zorlasir |
| `pdfmake` | Deklaratif rapor/tablo PDF | 14.58 MB | MIT | Iyi | Iyi** | Iyi | Tablo agir raporlar icin iyi alternatif |

\** Turkce destek notu: PDF uretiminde asil konu Unicode/font embedding. Varsayilan fontlar her zaman yeterli degil. Turkce karakterlerin garantili cikmasi icin ozel font register etmek gerekir.

### Degerlendirme

`@react-pdf/renderer`, React/Next.js projeleri icin en dogal secim. Ayni component zihniyetiyle sablonlar yazilir, server tarafinda PDF stream/file uretilebilir ve tasarim kodu uygulama component mantigina yaklasir.

`jsPDF`, hizli "indir" butonu senaryolari icin kullanisli ama layout derinlestikce maliyeti artis gosterir. Ozellikle cok sayfali dokuman, tablo, header/footer ve deterministic layout ihtiyacinda kolay kirilir.

`pdfmake`, tablo ve kurumsal rapor tarafinda gercek bir rakip. Eger belge tipi agirlikla tablo + rapor ise `pdfmake` dusunulebilir. Fakat React tabanli urunde uzun vadede `react-pdf` daha uyumlu.

### Karar

**Secim: `@react-pdf/renderer`**

Uygulama notlari:

- Turkce karakterler icin ilk gunden custom font register edin.
- Hyphenation gerekiyorsa Turkce icin custom callback dusunun; gerekmezse hyphenation'i kapatmak daha guvenli.
- PDF uretimini Route Handler veya Node runtime server utility tarafinda yapin.

---

## 5. Canvas / Annotation

### Karsilastirma

| Kutuphane | Ana guc | Bundle size | Lisans | Next.js 15 | Turkce destek | Supabase entegrasyonu | Not |
|-----------|----------|-------------|--------|------------|---------------|------------------------|-----|
| `konva` | React ile kontrollu canvas katmani, iyi performans | 1.40 MB | MIT | Cok iyi | Iyi | Cok iyi | Faz 1 onerisi |
| `fabric` | Nesne modeli zengin, klasik canvas editor | 24.64 MB | MIT | Iyi | Iyi | Iyi | Daha agir ve mutable |
| `tldraw` | Whiteboard/SDK deneyimi, hazir editor hissi | 11.39 MB | Ozel lisans | Orta | Iyi | Orta | Faz 1 icin fazla buyuk/yuksek seviyeli |

### Degerlendirme

PDF ustune annotation, serbest cizim, box, highlight, pin, comment gibi isler icin `konva` daha dogru orta yol. React ile state kontrollu calisir; bu, Next.js tarafinda "annotation JSON'u veritabaninda sakla, canvas'i yeniden hydrate et" modelini kolaylastirir.

`fabric`, ozellikle geleneksel WYSIWYG canvas editor icin guclu ama mutable nesne modeli React state akisiyla daha fazla surtusur. Ayrica belirgin sekilde daha agir.

`tldraw`, harika bir urun hissi verir ama Faz 1 ihtiyacindan buyuktur. Lisans modeli de dikkat ister. PDF annotation yerine Miro/FigJam benzeri whiteboard gerekiyorsa mantikli olur; aksi durumda gereksiz komplekslik getirir.

### Karar

**Secim: `konva`**

Veri modeli onerisi:

- `documents`
- `document_pages`
- `document_annotations`

`document_annotations.payload` icinde shape JSON saklanabilir. Render katmani tamamen istemcide, kalicilik Supabase'de olur.

---

## 6. Embedding / Vector Search

### Karsilastirma

| Secenek | Bundle size | Lisans | Next.js 15 | Turkce destek | Supabase entegrasyonu | Not |
|---------|-------------|--------|------------|---------------|------------------------|-----|
| `pgvector` | 0.04 MB | MIT | Cok iyi | Modele bagli | Mukemmel | Faz 1 onerisi |
| `@pinecone-database/pinecone` | 2.51 MB | Apache-2.0 | Iyi, ama server-side | Modele bagli / entegre modeller var | Zayif-Orta | Buyuk olcek ve ayri servis |

### Degerlendirme

Faz 1 icin **`pgvector` acik ara daha dogru**. Sebep teknik oldugu kadar urunel:

- Zaten Supabase kullaniyorsunuz
- Ayrica baska bir vector veritabani isletme zorunlulugu cikmiyor
- Auth, RLS ve is verisi ayni Postgres baglaminda kaliyor
- Basit semantic search / RAG / benzer dokuman bulma icin yeterli

Supabase dokumantasyonu, `pgvector` uzantisinin embedding saklama ve similarity search icin dogrudan kullanildigini acikca gosteriyor. Bu Faz 1'de operasyonel sadeligi maksimuma cikarir.

`Pinecone`, asagidaki durumlarda mantikli hale gelir:

- Cok yuksek veri hacmi
- Postgres'ten ayri, uzmanlasmis vector servis ihtiyaci
- Ayrik olceklenme
- Pinecone'un integrated inference veya managed retrieval ozelliklerini bilerek kullanma istegi

### Karar

**Secim: `pgvector`**

Ek not:

- Turkce kalitesi veritabaniyla degil, secilen embedding modeliyle belirlenir.
- Turkce icin cok dilli embedding modeli kullanilmalidir.
- Faz 1'de vector + metadata ayni Postgres tablosunda tutulmali.

---

## 7. Test: Vitest vs Playwright

### Karsilastirma

| Arac | Ana rol | Bundle size | Lisans | Next.js 15 | Turkce destek | Supabase entegrasyonu | Not |
|------|----------|-------------|--------|------------|---------------|------------------------|-----|
| `vitest` | Unit/integration/component test | 1.80 MB | MIT | Cok iyi | Iyi | Iyi | Bu repoda zaten var |
| `playwright` | Gercek browser E2E | 3.17 MB | Apache-2.0 | Cok iyi | Iyi | Iyi | E2E icin gerekli |

### Degerlendirme

Bu alanda "tek kazanan" secmek dogru degil. `Vitest` ve `Playwright` ayni sorunu cozmuyor.

Faz 1 karari su olmali:

- `Vitest`: domain logic, parser utility, mapper, transformer, validation
- `Playwright`: upload akisi, auth, PDF goruntuleme, annotation kaydetme, export/import smoke testleri

Bu repo zaten `Vitest` kullaniyor. Dolayisiyla unit/integration katmani icin mevcut cizgi korunmali; sadece ustune kritik akislari kapsayan az sayida `Playwright` E2E eklenmeli.

### Karar

**Secim: birlikte kullanim**

Tek cizgi karar:

- Varsayilan test araci: `Vitest`
- Urun guvencesi icin zorunlu ek katman: `Playwright`

---

## Onerilen Faz 1 Stack

| Alan | Oneri |
|------|-------|
| PDF parsing | `unpdf` |
| Excel | `xlsx` (SheetJS) |
| Google Drive | `googleapis` + OAuth2 |
| PDF generation | `@react-pdf/renderer` |
| Annotation | `konva` |
| Vector search | `pgvector` |
| Test | `Vitest` + `Playwright` |

---

## Mimari Oneriler

## API Route vs Server Action

### Server Action kullan

Asagidaki durumlarda:

- Kucuk form submit
- Kullanici session'ina bagli CRUD
- UI'dan gelen yapilandirilmis veri guncellemeleri
- Dosya disi, JSON tabanli is akislar

Avantaj:

- Daha az boilerplate
- App Router ile iyi uyum
- Supabase server client ile dogrudan birlikte calisir

### Route Handler kullan

Asagidaki durumlarda:

- Google OAuth callback
- Dosya upload / download
- PDF binary response
- Excel/PDF export stream
- Webhook
- Buyuk payload
- Uzun suren server-side parsing

**Faz 1 kural:** Binary, OAuth ve dis servis callback isi varsa `Route Handler`; saf UI mutation ise `Server Action`.

---

## Edge vs Node

### Node runtime sec

Asagidaki tum ana isler icin:

- PDF parsing
- Excel parsing
- Google Drive API
- PDF generation
- Buyuk dosya isleme
- Vector batch insert

Sebep:

- `googleapis` Node odakli
- PDF ve Excel kutuphanelerinin cogu Node'da daha stabil
- Binary/stream isleri Node'da daha az surpriz cikarir

### Edge runtime sadece sinirli yerlerde kullan

- Hafif auth gate
- Cok kucuk read-only endpoint
- Cache/redirect/middleware benzeri dusuk maliyetli isler

**Faz 1 sonucu:** Varsayilan runtime `Node` olmali. Edge, ancak net bir latency sebebi varsa eklenmeli.

---

## Dosya Upload Stratejisi

### Onerilen akis

1. Kullanici dosyayi dogrudan **Supabase Storage**'a yukler.  
2. Tarafimizda sadece metadata ve is kaydi olusturulur.  
3. Yukleme bitince server tarafinda parse/gorev tetiklenir.  
4. Sonuclar `documents`, `document_chunks`, `document_embeddings`, `document_annotations` tablolarina yazilir.

### Neden Next.js sunucusundan proxy upload degil?

- Buyuk dosyada gereksiz sunucu trafigi olusur
- Vercel/Node request timeout riskini artirir
- Maliyet ve hata olasiligi yukselir

### Pratik Faz 1 modeli

- Client -> Supabase Storage
- Client -> Server Action veya Route Handler ile `document` kaydi
- Node Route Handler -> Storage'dan dosyayi cek -> parse et -> DB'ye yaz

### Google Drive import stratejisi

Google Drive'dan gelen dosya icin:

- Route Handler tetiklenir
- `googleapis` ile dosya stream edilir
- Dosya once Storage'a yazilir
- Sonra ayni pipeline ile parse edilir

Bu sayede "yerel upload" ve "Drive import" ayni belge isleme hattina girer.

---

## Faz 1 Icin Net Oneri

En az riskli ve en hizli ilerleyen mimari:

- **Node runtime agirlikli App Router**
- **Supabase Storage + Supabase Postgres + pgvector**
- **`unpdf` ile PDF extraction**
- **`SheetJS` ile spreadsheet import/export**
- **`googleapis` ile server-side Drive entegrasyonu**
- **`@react-pdf/renderer` ile PDF export**
- **`konva` ile annotation UI**
- **`Vitest` unit/integration + `Playwright` kritik E2E**

Bu kombinasyon Faz 1'de servis sayisini minimumda tutar, Next.js uyumlulugu yuksektir ve Supabase etrafinda tek bir veri omurgasi kurar.

---

## Kaynaklar

### Resmi dokumanlar

- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Next.js Edge ve Node runtimes: https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
- Supabase `pgvector`: https://supabase.com/docs/guides/database/extensions/pgvector
- Pinecone docs: https://docs.pinecone.io/guides/get-started/concepts
- Google Drive API quickstart: https://developers.google.com/workspace/drive/api/quickstart/nodejs
- Google OAuth 2.0 web server flow: https://developers.google.com/identity/protocols/oauth2/web-server
- React PDF docs: https://react-pdf.org/
- PDF.js docs: https://mozilla.github.io/pdf.js/
- Fabric.js docs: https://fabricjs.com/docs/getting-started/installing/
- Konva docs: https://konvajs.org/
- tldraw docs: https://tldraw.dev/
- SheetJS docs: https://docs.sheetjs.com/
- PapaParse docs: https://www.papaparse.com/docs
- Playwright docs: https://playwright.dev/
- Vitest docs: https://vitest.dev/

### npm registry verileri

- https://www.npmjs.com/package/unpdf
- https://www.npmjs.com/package/pdfjs-dist
- https://www.npmjs.com/package/pdf-parse
- https://www.npmjs.com/package/xlsx
- https://www.npmjs.com/package/exceljs
- https://www.npmjs.com/package/papaparse
- https://www.npmjs.com/package/googleapis
- https://www.npmjs.com/package/@googleapis/oauth2
- https://www.npmjs.com/package/@react-pdf/renderer
- https://www.npmjs.com/package/jspdf
- https://www.npmjs.com/package/pdfmake
- https://www.npmjs.com/package/fabric
- https://www.npmjs.com/package/konva
- https://www.npmjs.com/package/tldraw
- https://www.npmjs.com/package/pgvector
- https://www.npmjs.com/package/@pinecone-database/pinecone
- https://www.npmjs.com/package/vitest
- https://www.npmjs.com/package/playwright
