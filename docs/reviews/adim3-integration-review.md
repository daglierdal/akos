# Adim 3 Integration Code Review

Tarih: 2026-04-05
Kapsam: `5611ee5`, `31cba1d`, `d7c2568`, `a344a7e`, `24a9194`, `d86885b`, `3f4b686`, `75cbb7e`
Scope: L/XL

Not: Verilen spec referansi `docs/spec/dokuman-proje-teklif-spec.md` repo'da ve git gecmisinde bulunamadi. Bu review, kullanicinin verdigi review kriterleri ve mevcut implementasyonun davranisi uzerinden yapildi. Bu eksiklik tek basina surec riski olusturuyor.

## Genel Not

Genel not: **D**

Bu paket "feature eklendi" seviyesinde ilerlemis, ancak entegrasyon katmaninda ciddi kiriklar var. En buyuk problem P2/P6/P7 kodunun, P1/P2 sonrasinda degisen `drive_files` veri modeline uyarlanmamis olmasi. Bu kirik yuzunden proje kodu, musteri, Drive klasorleri, proje paneli ve arama akislarinin onemli bolumu runtime'da bozuluyor. Ustune dokuman parsing zinciri upload ile baglanmadigi icin full-text search ve docs->BOQ akislarinin da gercek kapsami dusuyor.

## Alan Notlari

| Alan | Not | Ozet |
| --- | --- | --- |
| 1. Spec Uyumu | **D** | Ana feature basliklari isim olarak var, fakat birkac kritik akis partial veya kirik. |
| 2. Tool Registry | **B** | Istenen 14 tool'un 14'u de registry'de var; ancak bazi tool'lar davranis olarak eksik/yanlis. |
| 3. Veri Modeli | **D** | BOQ/proposal tablolari zengin, ama proje-kod-musteri baglantisi zayif; `drive_files` tarafinda bead'ler arasi schema drift var. |
| 4. Chat-First | **C-** | Chat proje-baglamli calisiyor ve side panel var; ancak prompt butun tool set'i anlatmiyor, approval semantigi yok, bazi paneller mock. |
| 5. Guvenlik | **D** | Tenant RLS genelde var, ama rol enforcement parcali ve chat RLS tenant-geneli. |
| 6. Kod Kalitesi | **C+** | `strict` acik, `tsc` ve testler geciyor; fakat kritik yerlerde `as any` ile tip sistemi delinmis. |
| 7. Entegrasyon | **D-** | 8 commit birlikte stabil bir uctan uca akis vermiyor. En kirik alan Drive + upload + project metadata + proposal panel. |

## Kritik Bulgular

### 1. `drive_files` schema drift'i entegrasyonun merkezini kiriyor
Seviye: **P1**

`5611ee5` ile gelen eski `drive_files` modeli `provider/external_file_id/project_code/project_name/path/is_folder/metadata` alanlarini kullaniyor. Ancak `31cba1d` sonrasinda tablo `drive_file_id/drive_parent_id/file_role/document_type/...` seklinde yeniden tanimlanmis ve eski alanlar kaldirilmis. Buna ragmen proje klasor olusturma, upload routing, proje arama, proje status ve project panel hala eski kolonlari kullaniyor.

Kanıt:
- `supabase/migrations/00006_google_drive.sql:30`
- `supabase/migrations/00006_faz1_schema.sql:52`
- `src/lib/ai/tools/createDriveFolder.ts:79`
- `src/lib/ai/tools/createDriveFolder.ts:196`
- `src/lib/documents/upload-service.ts:239`
- `src/lib/documents/upload-service.ts:427`
- `src/lib/documents/upload-service.ts:441`
- `src/lib/ai/tools/searchProjects.ts:52`
- `src/lib/ai/tools/getProjectStatus.ts:66`
- `src/components/panels/project-panel.tsx:153`

Etkisi:
- `createProject` Drive kaydini patlatabilir.
- Upload olduktan sonra route/folder metadata okunamayabilir.
- `searchProjects`, `getProjectStatus`, `ProjectPanel` proje kodu ve musteriyi getiremeyebilir.
- P2/P3/P7 birbirine uyumsuz.

### 2. Dokuman parsing zinciri upload ile bagli degil; full-text ve docs->BOQ akislari pratikte calismiyor
Seviye: **P1**

`searchDocuments` ve `generateBOQFromDocs` sadece `documents.parsed_text` uzerinden calisiyor. Fakat upload akisi hicbir yerde `processDocument()` cagirmiyor; upload edilen tum dokumanlar `parsed_text: null` ile kaydediliyor. Ayrica parser sadece `storage_type = 'supabase'` dosyalarini destekliyor; Drive'a giden dosyalar parse edilemiyor.

Kanıt:
- `src/lib/ai/tools/searchDocuments.ts:37`
- `src/lib/ai/tools/generateBOQFromDocs.ts:20`
- `src/lib/documents/upload-service.ts:659`
- `src/lib/documents/processing-service.ts:19`
- `src/lib/documents/processing-service.ts:73`
- `src/lib/documents/processing-service.ts:95`
- `src/lib/documents/processing-service.ts:19` fonksiyonunun repo genelinde cagrisi yok

Etkisi:
- "AI dokuman sorgulama (full-text search)" kriteri ancak elle parse edilirse calisiyor.
- Hibrit depolama hedefiyle catisiyor; Drive'a giden buyuk/non-AI dosyalar sorgulanamiyor.
- `generateBOQFromDocs` teorik olarak var, ama girdisi cogu zaman bos kalacak.

### 3. Proje-musteri-proposal veri baglantisi dogru modellenmemis; PDF musteri bilgisini proje adindan tahmin ediyor
Seviye: **P1**

`createProject` musteri yaratip donuyor ama projeye musteri FK'si yazmiyor; `projects` tablosunda boyle bir kolon da yok. Sonuc olarak proposal/PDF katmani gercek musteri bagini kaybetmis. PDF tarafinda musteri, `customers.name ILIKE project.name` ile bulunmaya calisiliyor; bu domain olarak yanlis.

Kanıt:
- `supabase/migrations/00001_create_schema.sql:41`
- `src/lib/ai/tools/createProject.ts:132`
- `src/lib/proposals/pdf-service.ts:188`
- `src/lib/proposals/pdf-service.ts:278`

Etkisi:
- Proje musteri iliskisi kalici degil.
- PDF'de yanlis musteri, bos musteri veya hic musteri cikabilir.
- Project search/status musteri bilgisini DB yerine Drive metadata'dan turetmek zorunda kaliyor.

### 4. Teklif side panel'i secili proje yerine tenant icindeki son teklifi gosterebiliyor
Seviye: **P2**

`ProposalSummary` komponenti prop almiyor; `/api/proposals/summary` da `projectId` istemeden tenant icindeki son guncel teklifi getiriyor. Bu nedenle proje bazli chat/panel baglaminda yanlis projenin teklifi gosterilebilir.

Kanıt:
- `src/components/proposals/proposal-summary.tsx:33`
- `src/components/chat/chat-page-client.tsx:298`
- `src/app/api/proposals/summary/route.ts:19`

Etkisi:
- P7 "project-aware chat + UI" hedefi bozuluyor.
- Side panel ile ana sohbet baglami ayrisabiliyor.

### 5. Admin/User ayrimi parcali; `needsApproval` metadata'si pratikte etkisiz
Seviye: **P2**

Sadece `createProject`, `submitProposal`, `search/list/view all` gibi az sayida yerde rol kontrolu var. `createProposal`, `importBOQ`, `importPriceList`, `uploadDocument` gibi mutating tool'lar role bakmiyor. Ayrica `needsApproval` alani sadece tipte var; chat runtime'i bunu hic kullanmiyor.

Kanıt:
- `src/lib/auth/permissions.ts:7`
- `src/lib/ai/tools/createProposal.ts:35`
- `src/lib/ai/tools/importBOQ.ts:17`
- `src/lib/ai/tools/importPriceList.ts:16`
- `src/lib/ai/tools/uploadDocument.ts:30`
- `src/lib/ai/tools/tool-definition.ts:12`
- `src/app/api/chat/route.ts:115`

Etkisi:
- Admin/User ayrimi spec'te beklendigi kadar guclu degil.
- "approval gerektiren tool" kavrami UI/agent katmaninda enforce edilmiyor.

### 6. Chat verisi tenant icinde kullanici bazli izole degil
Seviye: **P2**

RLS, `chat_sessions` ve `chat_messages` icin sadece `tenant_id = get_tenant_id()` kosulu koyuyor. App tarafinda listeleme `user_id` ile filtrelenmis olsa da DB policy seviyesinde ayni tenant'taki kullanicilar diger kullanicilarin chat oturumlarini okuyabilir/guncelleyebilir.

Kanıt:
- `supabase/migrations/00002_enable_rls.sql:177`
- `supabase/migrations/00002_enable_rls.sql:193`
- `src/lib/chat/chat-store.ts:126`
- `src/lib/chat/chat-store.ts:170`

Etkisi:
- Tenant izolasyonu var, kullanici izolasyonu yok.
- Ozellikle proje/teklif konusmalarinda bilgi sizmasi riski.

### 7. BOQ import ve fiyat onerisi UI'lari gercek backend entegrasyonuna bagli degil
Seviye: **P2**

BOQ import wizard mock preview ile calisiyor ve kendi icinde "backend hazir olana kadar" notu tasiyor. Price suggestion panel de placeholder veri kullaniyor; accept/reject aksiyonlari kalici degil.

Kanıt:
- `src/components/boq/boq-import-wizard.tsx:61`
- `src/components/boq/boq-import-wizard.tsx:136`
- `src/components/boq/boq-import-wizard.tsx:274`
- `src/components/boq/price-suggestion-panel.tsx:30`
- `src/components/boq/price-suggestion-panel.tsx:93`

Etkisi:
- "BOQ import UI'da gorunuyor mu?" sorusunun cevabi ancak mock seviyesinde evet.
- "AI fiyat onerisi" backend var, ama side panel entegrasyonu gercek degil.

### 8. Proje kodu ve Drive root naming tutarsiz; tenant-scope sequence de global sayiliyor
Seviye: **P2**

`createProject` proje kodunu `PREFIX-YEAR-SEQ` formatinda uretiyor. Proposal/upload katmani ise proje adindan tekrar farkli bir kod turetiyor. Ustelik `createProject` sequence sayimini tenant filtresi olmadan yapiyor.

Kanıt:
- `src/lib/ai/tools/createProject.ts:111`
- `src/lib/projects/project-code.ts:14`
- `src/lib/proposals/proposal-service.ts:317`
- `src/lib/documents/upload-service.ts:274`

Etkisi:
- Ayni proje icin farkli kodlar ve farkli root folder isimleri olusabilir.
- Cross-tenant proje sayisi sequence'i etkileyebilir.

## Tool Registry Sonucu

Istenen tool'larin durumu:

| Tool | Durum | Not |
| --- | --- | --- |
| `createProject` | Var | Drive entegrasyonu schema drift nedeniyle riskli |
| `uploadDocument` | Var | Hibrit storage var, parsing pipeline bagli degil |
| `searchDocuments` | Var | `parsed_text` dolmazsa fiilen bos doner |
| `createProposal` | Var | Revizyon dahil; rol kontrolu yok |
| `importBOQ` | Var | Backend var, UI gercek entegrasyona bagli degil |
| `generateBOQFromDocs` | Var | Naif satir extractor, parsing bagimliligi var |
| `suggestPrices` | Var | Backend var |
| `searchPrices` | Var | Backend var |
| `importPriceList` | Var | Backend var, rol kontrolu yok |
| `calculateProposal` | Var | Backend var |
| `submitProposal` | Var | PDF + Drive + status update var |
| `linkFileToProposal` | Var | Var |
| `getProjectStatus` | Var | `drive_files` schema drift nedeniyle riskli |
| `searchProjects` | Var | `drive_files` schema drift nedeniyle riskli |
| `listProposals` | Var | Var |
| `listDocuments` | Var | Var |
| `getMorningBriefing` | Var | Var |

Sonuc: **14/14 tool implemente edilmis**. Ayrica `createDriveFolder` ve `getDashboard` ekstra tool olarak mevcut.

Not: Chat system prompt butun tool set'i expose etmiyor; `createProposal`, `importBOQ`, `suggestPrices`, `submitProposal` vb. prompt'ta acikca listelenmemis.

## Veri Modeli Degerlendirmesi

Gozlenen gucler:
- BOQ icin 4 seviye hiyerarsi var: `boq_disciplines -> boq_categories -> boq_subcategories -> boq_items`
- Dual pricing var: `malzeme_bf`, `iscilik_bf`, `toplam_bf`, `tutar`
- Proposal snapshot modeli mantikli: `proposal_boq_items`
- Import staging tablolari var: `import_jobs`, `boq_import_rows`
- Document versioning ve processing job tablolari var

Eksik/zayif alanlar:
- `projects` tablosunda `customer_id` veya `project_code` yok
- `proposals` tablosunda musteri baglantisi yok
- `drive_files` etrafinda iki farkli schema tasarimi var; bead'ler ortak modele bulusmamis
- `documents` ile `drive_files` arasinda net, typed bir bag yok; metadata uzerinden dolasiliyor

## Chat-First Degerlendirmesi

Pozitif:
- Genel ve proje baglamli sohbet ayrimi var (`projectId` query param + `chat_sessions.project_id`)
- Side panel yapisi mevcut
- Chat session persistence var

Eksik:
- Tool kapasitesinin tamami system prompt'ta anlatilmiyor
- Approval semantigi yok
- Proposal panel proje-scoped degil
- BOQ import ve fiyat paneli mock/placeholder

## Guvenlik Degerlendirmesi

Pozitif:
- Yeni faz1 tablolarinin tamamina yakininda RLS aktif
- Tenant FK'lari genelde mevcut

Negatif:
- Chat tablolarinda tenant-ici user izolasyonu yok
- Rol enforcement sadece kismi
- `as any` ile tip katmani delinerek kritik DB operasyonlari korunaksiz hale getirilmis

## Kod Kalitesi Degerlendirmesi

Pozitif:
- `tsconfig.strict = true`
- `npx tsc --noEmit` geciyor
- `npm run test:ci` geciyor: 14 test dosyasi, 68 test

Negatif:
- Kritik veri modeli gecisleri `as any` ile maskelenmis
- Testler entegrasyon kiriklarini yakalamiyor; ozellikle `drive_files` schema drift'i runtime davranis seviyesinde kacmis
- UI testleri mock placeholder'lari gercek backend baglanti eksigini yakalamiyor

## Eksik / Partial Spec Maddeleri

Spec dosyasi bulunamadigi icin kullanici kriterlerinden cikarilan eksik/partial maddeler:

1. Proje olusturma + Drive klasor yapisi: isim olarak var, ancak `drive_files` schema uyumsuzlugu nedeniyle stabil degil.
2. Dosya upload + hibrit depolama + kategorize: storage routing var; parsing/indexing zinciri bagli degil.
3. AI dokuman sorgulama: full-text fonksiyonu var ama otomatik parse yok; Drive dosyalari parse disi.
4. BOQ import: backend var, side panel UI mock seviyesinde.
5. Fiyat veritabani + AI fiyat onerisi: backend var, UI placeholder.
6. Teklif revizyon + hesaplama + PDF + submit: backend zinciri var, ancak musteri baglantisi ve panel scoping sorunlu.
7. Chat katmanlari (genel/proje): temel iskelet var; tool discoverability ve panel baglami eksik.
8. Yetkilendirme (Admin/User): partial; tum mutating akislara tutarli uygulanmamis.
9. Arama tool'lari: isim olarak var; proje/musteri arama `drive_files` drift'inden etkileniyor.

## Commit Bazli Kisa Durum

- `5611ee5` P2: Google Drive OAuth ve ilk klasor modeli geldi, ama bu model daha sonra ortak veri modeline tasinmamis.
- `31cba1d` P1: Faz1 schema kapsamli ama eski Drive modelini replace edip uygulama katmanini tam migrate etmemis.
- `d7c2568` P4: Parsing/search yapisi eklenmis, fakat upload ile baglanmamis.
- `a344a7e` P3: Hibrit upload mantigi iyi, ama Drive schema ve parse entegrasyonu eksik.
- `24a9194` P5b: Side panel UX ilerlemis, fakat import/price panelleri mock.
- `d86885b` P5a: BOQ/price backend guclu, UI ile tam kapatilmamis.
- `3f4b686` P6: Proposal/PDF/submit zinciri anlamli, ama musteri ve panel scoping sorunlu.
- `75cbb7e` P7: Project-aware chat iyi yon, ama tum tool set, approval ve data scoping tam degil.

## Sonuc

Bu paket merge edilmis olsa da "Adim 3 entegrasyon tamam" seviyesinde degil. En kritik duzeltme sirasi:

1. `drive_files` icin tek bir kalici schema secip tum servis/tool/UI kodunu ona gore duzeltmek
2. Upload sonrasinda parse/index pipeline'ini baglamak ve Drive dosyalari icin strateji belirlemek
3. `projects` / `proposals` / `customers` iliskisini veri modelinde dogru kurmak
4. Proposal side panel'i secili proje baglamina almak
5. Admin/User yetkilerini tum mutating tool'lara uygulamak ve chat approval akisini gercekten enforce etmek
6. BOQ import ve AI fiyat panelini mock'tan gercek backend'e baglamak
