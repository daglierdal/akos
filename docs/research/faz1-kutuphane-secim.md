# Faz 1 Kutuphane Secim Arastirmasi

> **Tarih:** 2026-04-05
> **Kapsam:** Next.js 15 App Router odakli kutuphane secimi
> **Not:** Repo su anda `next@16.2.2` kullaniyor. Asagidaki "Next.js 15 uyumu"
> notlari App Router icin yazildi; 15 ile uyumlu olan secimler pratikte 16'da da
> calisir.

---

## Ozet

Faz 1 icin en guvenli secim seti:

1. **PDF/Word/Excel text extraction:** `unpdf` + gerekirse OCR/gorsel fallback
   olarak **Claude Vision**
2. **Excel BOQ import:** `xlsx` (SheetJS) ana parser, `papaparse` yalnizca CSV
   fallback
3. **Google Drive API:** `googleapis` + App Router `Route Handler` + server-side
   OAuth2
4. **Canvas/annotation markup:** `konva` ana secim; serbest cizim editoru
   urunlesirse `tldraw`
5. **PDF teklif olusturma:** `@react-pdf/renderer`
6. **State management:** `Zustand`
7. **Data table:** `TanStack Table`; kurumsal grid ihtiyaci buyurse `AG Grid`

Secim mantigi: MIT/Apache lisans, App Router ile dusuk surtunme, kontrollu
bundle etkisi, Turkce veriyle sorunsuz calisma ve gelecekte buyume payi.

---

## Metodoloji

- **Bundle size:** Mumkun oldugunda Bundlephobia min+gzip degerleri kullanildi.
- **Bundlephobia olmayan paketlerde:** `n/a` denip npm publish `unpacked size`
  notu eklendi.
- **Turkce destek:** Kutuphanenin dogrudan locale/UTF-8/font/localization
  kabiliyetine gore degerlendirildi. Bu alanin bir kismi teknik cikarimdir.
- **Next.js 15 uyumu:** App Router, RSC/client boundary, SSR ve edge/server
  kosullari uzerinden degerlendirildi.

---

## 1. PDF / Word / Excel Text Extraction

Bu baslikta asil ihtiyac "metin cikarma". Word/Excel tarafinda bu kutuphaneler
dogrudan yeterli degil; onlar icin ayri parser gerekir. Bu nedenle karar,
**PDF extraction katmani** icin verildi.

| Secenek | Bundle size | Lisans | Next.js 15 App Router uyumu | Turkce destek | Not |
|---|---:|---|---|---|---|
| `unpdf` | ~5 KB / ~2.1 KB gzip | MIT | Cok iyi; modern ESM, server/client ayrimi temiz | Iyi; Unicode metni korur, OCR yapmaz | En hafif ve modern secim |
| `pdfjs-dist` | ~397 KB / ~118 KB gzip | Apache-2.0 | Orta; client veya worker tarafinda daha rahat, server parsing agir | Iyi; text layer Unicode uretir, OCR yok | Viewer + low-level parse icin guclu |
| `pdf-parse` | ~464 KB / ~137 KB gzip | Apache-2.0 | Orta; calisir ama daha agir ve eski yaklasim hissi veriyor | Iyi; dijital PDF metninde yeterli, OCR yok | Legacy ekosistem avantajli |
| **Claude Vision** | SDK bundle'i degil, harici model cagrisi | Ticari | Iyi; server action/route handler uzerinden cagirilir | Cok iyi; taranmis PDF, tablo, karisik layout ve Turkce OCR-benzeri durumlarda guclu | Maliyet, gecikme ve veri tasima maliyeti var |

### Degerlendirme

- `unpdf`, modern runtime uyumlulugu ve cok kucuk paket izi nedeniyle ilk
  bakista en dengeli secim.
- `pdfjs-dist`, PDF viewer veya sayfa render ihtiyaci varsa daha mantikli;
  yalnizca text extraction icin gereksiz agir kalabilir.
- `pdf-parse`, kullanilabilir ama 2026 perspektifinde yeni projede ilk tercih
  olmak icin yeterli avantaj sunmuyor.
- Claude Vision kutuphane degil, ama **scan edilmis belge**, bozuk encoding,
  tablo/gorsel agir PDF ve karma teklif dokumanlarinda en guclu fallback.

### Oneri

**Birincil secim:** `unpdf`

**Fallback stratejisi:** dijital PDF'lerde `unpdf`, scan/gorsel agir
dosyalarda server-side **Claude Vision**.

**Neden:** Faz 1 icin dusuk bundle, kolay App Router entegrasyonu ve daha sonra
AI fallback ekleme imkani veriyor.

---

## 2. Excel BOQ Import

| Secenek | Bundle size | Lisans | Next.js 15 App Router uyumu | Turkce destek | Not |
|---|---:|---|---|---|---|
| `xlsx` (SheetJS) | ~402 KB / ~136 KB gzip | Apache-2.0 | Iyi; server-side parse icin en rahat secim | Iyi; Unicode hucre metni ve xlsx import guclu | BOQ import icin en olgun secim |
| `exceljs` | ~911 KB / ~250 KB gzip | MIT | Orta; Node tarafinda iyi, browser bundle'i daha pahali | Iyi; metin/stil/formul destegi guclu | Write/edit senaryolarinda daha guclu |
| `papaparse` | ~19 KB / ~7 KB gzip | MIT | Cok iyi; hafif ve browser dostu | Iyi; CSV Turkce veride sorun cikarmaz | XLSX degil, yalnizca CSV icin mantikli |

### Degerlendirme

- BOQ dosyalari sahada cogu zaman `.xlsx` gelir; bu nedenle `papaparse` tek
  basina yeterli degil.
- `xlsx`, import ve normalize etme tarafinda daha yaygin ve pratik.
- `exceljs`, workbook duzenleme, stiller, export ve ileri duzey kontrol
  gerektiginde guclu; ama yalniz import icin daha agir.

### Oneri

**Birincil secim:** `xlsx`

**Yardimci secim:** Kullanici CSV yuklerse `papaparse`

**Ne zaman `exceljs`:** Faz 2-3'te import edilen BOQ'u stil/formul/yorum
koruyarak yeniden yazmak gerekirse.

---

## 3. Google Drive API / OAuth2 / Next.js App Router

Bu baslikta pratikte uc entegrasyon paterni var:

| Secenek | Bundle size | Lisans | Next.js 15 App Router uyumu | Turkce destek | Not |
|---|---:|---|---|---|---|
| `googleapis` | ~11.4 MB / ~480 KB gzip | Apache-2.0 | Iyi; ama kesinlikle server-only tutulmali | N/A; API katmani, locale sorunu yok | Drive API icin resmi ve tam istemci |
| `google-auth-library` + raw REST `fetch` | ~160 KB / ~47 KB gzip | Apache-2.0 | Cok iyi; daha kucuk, daha kontrollu | N/A | Minimal entegrasyon isteyen ekipler icin |
| `next-auth` / Auth.js Google sign-in | ~276 KB / ~80 KB gzip | ISC | Iyi; oturum acma kolay, ama Drive API istemcisi degil | N/A | Login icin iyi, Drive erisimi tek basina yetmez |

### Degerlendirme

- `googleapis`, Drive, Docs, Sheets gibi Google servislerine tek resmi
  istemciyle erisim saglar. App Router icin en dogru kullanim:
  `app/api/.../route.ts` veya server action icinde OAuth2 token yenileme ve API
  cagrisi yapmaktir.
- `google-auth-library` + `fetch`, sadece 2-3 endpoint kullanilacaksa daha
  ince bir alternatif olabilir; ancak dosya yukleme, query parametreleri,
  media upload ve Google API yuzeyi buyudukce elle kod yukunu arttirir.
- `next-auth`, kullanici girisi icin iyi olsa da **Drive SDK yerine gecmez**.
  Yani kimlik + session icin kullanilabilir, ama Drive istemcisi olarak
  secilmemeli.

### Oneri

**Birincil secim:** `googleapis`

**Mimari onerisi:** OAuth callback, token refresh ve Drive cagrilarinin hepsi
**server-side Route Handler** uzerinden akmali. Access token istemciye
tasinmamali.

**Neden:** Faz 1'de hizli dogruluk ve Google API kapsam genisligi, bundle
kucultme kaygisindan daha onemli. `googleapis` client bundle'ina girmedigi
surece buyuk paket olmasi pratikte sorun olmaz.

---

## 4. Canvas / Annotation Markup

| Secenek | Bundle size | Lisans | Next.js 15 App Router uyumu | Turkce destek | Not |
|---|---:|---|---|---|---|
| `fabric` | ~298 KB / ~90 KB gzip | MIT | Orta; `use client` ve no-SSR dusunulmeli | Orta; text/font tarafini sizin yonetmeniz gerekir | Serbest canvas objeleri icin guclu |
| `konva` | ~176 KB / ~53 KB gzip | MIT | Iyi; React ile duzgun, annotation UI icin rahat | Orta; locale sistemi yok ama Unicode text sorun degil | Sekil tabanli annotation icin temiz secim |
| `tldraw` | Bundlephobia `n/a` | Source-available / ticari kosul icerebilir | Orta; client-only editor olarak calisir | Iyi; editor seviyesinde i18n daha olgun | Hazir whiteboard deneyimi verir |

### Degerlendirme

- `konva`, kutu/cember/cizgi/ok/not gibi klasik annotation katmani icin en
  dengeli secim. React tarafinda zihinsel modeli temiz.
- `fabric`, daha "canvas editor" tarzi, serbest transform ve obje manipule
  etmede guclu; ama state ve event modeli daha daginik hissedilebilir.
- `tldraw`, hazir editor deneyimi istendiginde cok hizli ilerletir; ancak lisans
  ve urun gomulu kullanim kosullari dikkatli incelenmeli.

### Oneri

**Birincil secim:** `konva`

**Ne zaman `tldraw`:** Urun hedefi basit annotation degil de tam beyaz tahta /
co-create editor olursa.

**Neden:** Faz 1'de isaretleme, kutulama, ok, olcu ve not ekleme gibi gorevler
icin `konva` yeterince guclu ve `tldraw` kadar agir/karma lisansli degil.

---

## 5. PDF Teklif Olusturma

| Secenek | Bundle size | Lisans | Next.js 15 App Router uyumu | Turkce destek | Not |
|---|---:|---|---|---|---|
| `@react-pdf/renderer` | Bundlephobia `n/a` | MIT | Cok iyi; server-side render akisi App Router'a cok uygun | Cok iyi; ozel font register edilirse Turkce karakterler guvenli | React mental modeliyle en uyumlu |
| `pdfmake` | ~953 KB / ~333 KB gzip | MIT | Iyi; browser ve server'da calisir | Iyi; font gomulurse Turkce temiz | JSON tabanli DSL, uzun dokumanda verbose |
| `jspdf` | ~391 KB / ~124 KB gzip | MIT | Iyi; client-side agirlikli | Orta; font ve layout yonetimi daha manuel | Basit PDF'ler icin hizli, teklif dokumaninda yorucu |

### Degerlendirme

- `@react-pdf/renderer`, React component agaci ile teklif/dokuman uretmek icin
  en dogal secim. Ozellikle teklif satirlari, bolumler, ara toplamlar ve
  sirket sablonlari tarafinda bakimi daha kolay.
- `pdfmake`, tablolari ve declarative tanimi sever; ama buyuk teklif
  sablonlari zamanla JSON DSL'e bogulur.
- `jspdf`, tek sayfa veya basit export icin iyi; ciddi teklif layout'u icin
  fazla dusuk seviye.

### Oneri

**Birincil secim:** `@react-pdf/renderer`

**Uygulama notu:** Turkce cikti icin ilk gunden ozel font (`Roboto`, `Inter`,
`Noto Sans`, vb.) register etmek gerekir. Varsayilan fontlarla Turkce
gliflerde risk alinmamali.

---

## 6. State Management

| Secenek | Bundle size | Lisans | Next.js 15 App Router uyumu | Turkce destek | Not |
|---|---:|---|---|---|---|
| `Zustand` | ~0.8 KB / ~0.5 KB gzip | MIT | Cok iyi; App Router'da client-store icin hafif | N/A | En az surtunmeli secim |
| `Jotai` | ~8.9 KB / ~3.8 KB gzip | MIT | Iyi; atom tabanli ince parcali state icin guclu | N/A | Karmasik atom grafi dogurabilir |
| `@reduxjs/toolkit` | ~36 KB / ~13 KB gzip | MIT | Iyi; ama boilerplate ve katilik daha yuksek | N/A | Buyuk ekip ve denetlenebilir akislar icin iyi |

### Degerlendirme

- Faz 1 kapsaminda AI-first belge, tablo ve modal akislari var; bu tip urunde
  global state genelde orta olceklidir. Bu nedenle `Zustand` en mantikli
  baslangic secimi.
- `Jotai`, derived/async atom modelinde zarif olabilir; ama ekipte atom
  disiplinini bozmak kolaydir.
- RTK, buyuk domain ve audit-friendly state icin iyi; Faz 1 hizina gore agir.

### Oneri

**Birincil secim:** `Zustand`

**Ne zaman `Jotai`:** UI icinde birbiriyle bagli, cok parcali derived state
agir basarsa.

**Ne zaman RTK:** Offline queue, complex entity cache ve denetlenebilir event
akisi belirgin sekilde buyurse.

---

## 7. Data Table

| Secenek | Bundle size | Lisans | Next.js 15 App Router uyumu | Turkce destek | Not |
|---|---:|---|---|---|---|
| `TanStack Table` | ~57 KB / ~15 KB gzip | MIT | Cok iyi; headless oldugu icin App Router'a temiz oturur | Iyi; locale/UI metinleri tamamen sizin kontrolunuzde | Esnek ve uzun omurlu secim |
| `AG Grid Community` | ~1.16 MB / ~323 KB gzip | MIT | Iyi; ama bundle ve API yuzeyi agir | Cok iyi; localeText ile olgun localization | Enterprise ihtiyaclara en yakin |
| `@mui/x-data-grid` | Bundlephobia `n/a` | MIT (Community) | Iyi; MUI ekosistemiyle hizli | Cok iyi; locale paketleri hazir | MUI bagimliligi getirir |

### Degerlendirme

- `TanStack Table`, shadcn/base-ui gibi mevcut hafif UI stack ile daha dogal
  uyumlu. Render kontrolu tamamen sizde oldugu icin BOQ grid'i urune ozel
  tasarlamak kolay.
- `AG Grid`, grouping, pinned columns, large dataset, Excel-benzeri davranislar
  ve power-user senaryolarinda en guclu secenek; ancak Faz 1 icin fazla agir
  olabilir.
- `MUI DataGrid`, hizli baslangic icin iyi ama repo'nun mevcut UI stack'i MUI
  odakli degil; yeni bir tasarim sistemi adasi olusturur.

### Oneri

**Birincil secim:** `TanStack Table`

**Ne zaman `AG Grid`:** BOQ duzenleme deneyimi Excel'e yaklasacaksa, cok buyuk
  veri ve power-user ozellikleri erken asamada gerekiyorsa.

---

## Son Karar Matrisi

| Alan | Onerilen secim | Ikinci secim | Not |
|---|---|---|---|
| PDF text extraction | `unpdf` | Claude Vision fallback | Scan PDF icin model fallback gerekli |
| Excel BOQ import | `xlsx` | `papaparse` (CSV) | `exceljs` yalniz write/edit gerekiyorsa |
| Google Drive API | `googleapis` | `google-auth-library` + REST | Tam Google kapsaminda resmi istemci daha guvenli |
| Canvas/annotation | `konva` | `tldraw` | Whiteboard degil annotation hedefleniyorsa `konva` |
| PDF teklif olusturma | `@react-pdf/renderer` | `pdfmake` | React tabanli belge bakimi daha iyi |
| State management | `Zustand` | `Jotai` | Faz 1 icin en dusuk surtunme |
| Data table | `TanStack Table` | `AG Grid Community` | UI esnekligi ve mevcut stack ile uyum daha iyi |

---

## Uygulama Onerisi

Faz 1 icin tavsiye edilen stack:

- **Belge parse:** `unpdf` + `xlsx`
- **CSV fallback:** `papaparse`
- **Google entegrasyonu:** `googleapis` server-side
- **Annotation:** `konva`
- **PDF render:** `@react-pdf/renderer`
- **State:** `zustand`
- **Grid:** `@tanstack/react-table`

Bu kombinasyon, Faz 1'de gereksiz ticari lisans riski almadan, App Router ile
uyumlu, kademeli buyumeye acik ve bundle disiplini makul bir temel sunar.

---

## Kaynaklar

### Paket / metadata

- `unpdf`: https://www.npmjs.com/package/unpdf
- `pdfjs-dist`: https://www.npmjs.com/package/pdfjs-dist
- `pdf-parse`: https://www.npmjs.com/package/pdf-parse
- `xlsx`: https://www.npmjs.com/package/xlsx
- `exceljs`: https://www.npmjs.com/package/exceljs
- `papaparse`: https://www.npmjs.com/package/papaparse
- `googleapis`: https://www.npmjs.com/package/googleapis
- `google-auth-library`: https://www.npmjs.com/package/google-auth-library
- `next-auth`: https://www.npmjs.com/package/next-auth
- `fabric`: https://www.npmjs.com/package/fabric
- `konva`: https://www.npmjs.com/package/konva
- `tldraw`: https://www.npmjs.com/package/tldraw
- `@react-pdf/renderer`: https://www.npmjs.com/package/@react-pdf/renderer
- `pdfmake`: https://www.npmjs.com/package/pdfmake
- `jspdf`: https://www.npmjs.com/package/jspdf
- `zustand`: https://www.npmjs.com/package/zustand
- `jotai`: https://www.npmjs.com/package/jotai
- `@reduxjs/toolkit`: https://www.npmjs.com/package/@reduxjs/toolkit
- `@tanstack/react-table`: https://www.npmjs.com/package/@tanstack/react-table
- `ag-grid-community`: https://www.npmjs.com/package/ag-grid-community
- `@mui/x-data-grid`: https://www.npmjs.com/package/@mui/x-data-grid

### Dokumantasyon

- PDF.js: https://mozilla.github.io/pdf.js/
- unpdf: https://github.com/unjs/unpdf
- Anthropic docs: https://docs.anthropic.com/
- SheetJS docs: https://docs.sheetjs.com/
- ExcelJS: https://github.com/exceljs/exceljs
- Papa Parse: https://www.papaparse.com/
- Google APIs Node client: https://github.com/googleapis/google-api-nodejs-client
- Google OAuth2 API docs: https://googleapis.dev/nodejs/googleapis/latest/oauth2/classes/Oauth2.html
- Fabric.js: http://fabricjs.com/
- Konva: https://konvajs.org/
- tldraw: https://tldraw.dev/
- React PDF: https://react-pdf.org/
- pdfmake: https://pdfmake.github.io/docs/0.1/
- jsPDF: https://github.com/parallax/jsPDF
- Zustand docs: https://zustand.docs.pmnd.rs/
- Jotai docs: https://jotai.org/
- Redux Toolkit: https://redux-toolkit.js.org/
- TanStack Table: https://tanstack.com/table
- AG Grid: https://www.ag-grid.com/
- MUI Data Grid: https://mui.com/x/react-data-grid/

### Bundle size

- Bundlephobia: https://bundlephobia.com/
