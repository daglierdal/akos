# Yükselen Oyuncular ve Trendler

> Durum notu. Hazırlanma tarihi: 5 Nisan 2026.  
> Odak: inşaat/AEC yazılımında yükselen AI oyuncuları, AI-native CAD, sesle saha raporlama ve "istihbarat katmanı" yaklaşımı.

## Kısa Özet

- Pazar iki ana hatta ayrılıyor: `tasarım/preconstruction otomasyonu` ve `saha gerçeğini veri katmanına çeviren iş zekası`.
- `ArchiLabs`, `BIMLOGIQ` ve `Clev` daha çok BIM/CAD üretkenliği ve model doğrulama tarafında konumlanıyor.
- `Downtobid` ve `Togal.AI` preconstruction tarafında çizim anlama, takeoff, scope çıkarma ve teklif akışını hızlandırıyor.
- `Buildots` ve `OpenSpace` sahadan görsel veri toplayıp bunu gecikme, kalite, koordinasyon ve karar desteğine çeviren "istihbarat katmanı" yaklaşımının en güçlü örnekleri.
- `Awaz.ai` doğrudan inşaat dikeyinde değil; ama ses tabanlı arayüzlerin saha raporlama, randevu, dispatch ve hands-free veri girişi için nasıl paketlenebileceğini gösteren genel amaçlı bir Voice AI platformu.
- Perakende fit-out nişinde AI kullanımı var, ancak halen yatay ve parçalı: test-fit/layout, takeoff, procurement, door/hardware estimate, saha raporu. Uçtan uca "retail fit-out AI OS" görünmüyor.

## 1. Şirketler

## ArchiLabs

**Ne yapıyor**

- Kendisini açık biçimde `AI-Native CAD Platform` olarak konumluyor.
- Tarayıcı tabanlı, Python-native, gerçek zamanlı işbirlikli ve deterministik doğrulama vurgulu bir CAD/BIM katmanı kuruyor.
- Özellikle `data center`, `MEP` ve karmaşık tesis tasarımı için konumlanmış görünüyor.

**Neden önemli**

- Bu şirket klasik "Revit'e AI eklentisi" yaklaşımından daha ileri gidiyor; doğrudan CAD ürününü AI için yeniden tasarladığını söylüyor.
- "Smart components", versiyon kontrolü, branch/merge mantığı ve doğrulamanın tasarım platformunun içinde yapılması güçlü bir farklılaşma.
- Bu, uzun vadede "AI-native CAD" tezinin en net örneklerinden biri.

**Sinyal**

- YC profiline göre `Fall 2024` şirketi ve "AI Copilot for Architects" olarak tanımlanıyor.
- Resmi sitede IFC/DXF/PDF export, mevcut çizim import ve mevcut stack ile birlikte çalışma vurgulanıyor; yani tamamen rip-and-replace değil.

**Risk / sınırlama**

- Pazar anlatısı güçlü, fakat kamuya açık müşteri/ölçek verisi sınırlı.
- Kısa vadede en güçlü wedge muhtemelen "AI-native yeni CAD" değil, mevcut BIM araçları yanında hız/otomasyon katmanı olmak.

## BIMLOGIQ

**Ne yapıyor**

- Revit içine gömülü AI araçları sunuyor.
- İki öne çıkan ürün:
  - `BIMLOGIQ Copilot`: doğal dille Revit etkileşimi, kod yazmadan komut/eklenti üretme.
  - `Smart Annotation`: tagging, dimensioning ve dokümantasyon otomasyonu.

**Neden önemli**

- Çok net bir acı noktaya oynuyor: üretkenlik değil, doğrudan `documentation labor`.
- Annotation ve dimensioning halen çok yüksek hacimli, düşük marjlı ve tekrarlı iş; AI burada doğrudan ROI üretiyor.
- "100+ brands worldwide" ifadesi, çok erken aşama oyunculara göre daha olgun ticari sinyal veriyor.

**Sinyal**

- Resmi "About" sayfasında Sidney merkezli olduğunu ve AEC için AI tabanlı tasarım/dokümantasyon otomasyonu geliştirdiğini söylüyor.
- Dokümantasyonda batch annotation, quick mode, collision-aware tagging gibi daha operasyonel kullanım örnekleri var.

**Risk / sınırlama**

- Ürün mantığı hala büyük ölçüde `Revit add-in economy` içinde.
- Bu yüzden platform değil, güçlü ama daha dar bir `workflow accelerator` olarak okunmalı.

## Clev

**Ne yapıyor**

- BIM/CAD için AI copilot olarak konumlanıyor.
- Resmi site mesajı: `hız ve uyum` (`velocità e conformità`).
- IFC viewer, doğal dil ile sorgulama, otomatik quantity/takeoff benzeri kullanım ve compliance kontrolü vurgulanıyor.

**Neden önemli**

- Clev'in farkı "yaratıcı üretim"den çok `kontrol`, `doğrulama`, `uyum`, `parametre yönetimi` tarafında.
- Bu onu BIM authoring aracı değil, BIM governance / review intelligence yönüne yaklaştırıyor.
- Özellikle BIM coordinator ve kurumsal standart yöneten ekipler için anlamlı.

**Sinyal**

- Resmi sitede normlar, ISO, iç kurallar ve müşteri taleplerine karşı `otomatik kontroller` vurgulanıyor.
- Kamuya açık üçüncü taraf analizlerde review süresini düşürme ve compliance/QTO otomasyonu anlatısı öne çıkıyor; fakat bu kısım üreticinin kendi anlatısına göre daha az doğrulanmış durumda.

**Risk / sınırlama**

- Şirket yeni ve ürün kapsamı kamuya açık kaynaklarda tam net değil.
- En güçlü pozisyonu bugün için "BIM intelligence/control layer" gibi duruyor; tam authoring platform değil.

## Downtobid

**Ne yapıyor**

- Genel yüklenici ve taşeronlar için AI destekli bid management yazılımı.
- Plan set yüklenince scope of work tespiti, trade package önerisi, subcontractor shortlist ve kişiselleştirilmiş ITB akışları üretiyor.

**Neden önemli**

- İnşaatta AI'nin en pragmatik wedge'lerinden biri: `çizimi anlamak -> scope çıkarmak -> doğru taşerona doğru paket göndermek`.
- Burada tam kusursuz çizim zekası gerekmeden ciddi değer üretilebiliyor.
- Bu nedenle preconstruction AI'nin ürün-pazar uyumuna en yakın alanlarından biri.

**Sinyal**

- Resmi sitede PDF planlardan trade scope ve scope notes taslağı çıkarma, CSV ile sub list import ve kişiselleştirilmiş invite akışı anlatılıyor.
- YC profilinde şirketin uzun vadeli vizyonunu "construction blueprints'i anlayan AI" olarak tarif ettiği görülüyor; bugün bunun ilk ürünü bidding workflow.
- YC sayfasında özellikle `retail projects` inşa eden GCler için intro çağrısı dikkat çekiyor; perakende fit-out ile en açık bağlardan biri burada.

**Risk / sınırlama**

- Şimdilik en güçlü olduğu yer `bidding orchestration`; tam takeoff veya tam çizim zekası değil.
- Eğer büyük platformlar aynı capability'yi yerel olarak eklerse baskı görebilir.

## Togal.AI

**Ne yapıyor**

- AI tabanlı takeoff yazılımı.
- Çizimlerden otomatik detect/measure/compare yapıyor; "talk to your plans" şeklinde `Togal.CHAT` katmanı da var.
- Drywall, electrical, FF&E, GC gibi trade bazlı dikeyleşme işaretleri veriyor.

**Neden önemli**

- Takeoff, AI için en net ve metriklenebilir problem alanlarından biri.
- "98% accuracy", "5x faster", cloud collaboration ve revision compare gibi vaatler doğrudan teklif kalitesi ve hızına bağlanıyor.
- Trade bazlı sayfa yapısı, yatay ürünün zamanla mikro-dikeylere ineceğini gösteriyor.

**Sinyal**

- Resmi site ve help center, floor plans ve reflected ceiling plans üzerinde otomatik takeoff akışını detaylandırıyor.
- "Built by builders, for builders" anlatısı ve kurucunun aile inşaat işi kökeni pazarlama açısından güçlü.

**Risk / sınırlama**

- Takeoff alanı kalabalıklaşıyor; sürdürülebilir fark için workflow, memory, benchmark veri ve trade-specific derinlik gerekecek.
- Uzun vadede sadece "AI takeoff" olmak yetmeyebilir; change order, VE, procurement ve bid intelligence'a genişlemek gerekecek.

## Buildots

**Ne yapıyor**

- Görsel veri üzerinden ilerleme takibi ve performans odaklı saha yönetimi.
- Sitede ana vaat: AI ile progress tracking ve gecikmeleri azaltma.
- Kamera/helmet walk verisini plan ve programa bağlayıp sapma görünürlüğü veriyor.

**Neden önemli**

- Buildots, "AI = chatbot" değil, "AI = ölçüm ve kontrol altyapısı" çizgisinde.
- Asıl değer önerisi otomatik site progress telemetry: ekiplerin ilerlemeyi hisle değil veriyle yönetmesi.
- Bu onu tam olarak `istihbarat katmanı` yaklaşımının merkezine koyuyor.

**Sinyal**

- Resmi sitede "delays by up to 50% reduction" iddiası var.
- Çok sayıda büyük GC logosu gösteriyor; pazarda kurumsal kabul gördüğüne işaret ediyor.

**Risk / sınırlama**

- Satış döngüsü ve onboarding ağır olabilir.
- Sahadan güvenilir ve düzenli capture disiplini gerektirir; ürün kalitesi kadar saha operasyonu da kritik.

## OpenSpace

**Ne yapıyor**

- Kendisini `Visual Intelligence Platform for Builders` olarak tanımlıyor.
- Capture, Field, Progress Tracking, Air ve BIM+ ürünleriyle tek tek point solution değil, görsel veri platformu kuruyor.
- 360 kamera, telefon, drone, lazer tarama ve BIM eşlemesini tek akışta topluyor.

**Neden önemli**

- OpenSpace'in asıl gücü, görsel kayıt ile iş akışı arasındaki bağı kurması.
- Sitede açıkça "intelligence from images" ve "visual intelligence" dili var; bu da platformu foto arşivi olmaktan çıkarıyor.
- Voice ile note alma, AI autolocation ve iş akışı entegrasyonları saha ile ofis arasındaki veri sürtünmesini azaltıyor.

**Sinyal**

- Resmi siteye göre `64 billion square feet captured` ve `131 countries served`.
- Field ürününde "image-based task management" ve AI autolocation; Capture ürününde Spatial AI ile floor plan/BIM mapping öne çıkıyor.

**Risk / sınırlama**

- Bu kategori zamanla commoditize olabilir; farkı kalıcı kılan şey veri ağı, entegrasyon ve karar iş akışına ne kadar gömüldüğü olacak.

## Awaz.ai

**Ne yapıyor**

- No-code AI voice agents platformu.
- Inbound/outbound çağrı, randevu, scheduling, lead qualification ve support senaryoları için insan benzeri voice botlar kurduruyor.

**Neden önemli**

- Doğrudan construction-native değil.
- Buna rağmen ses tabanlı veri girişi, görev tetikleme, saha ekipleri için hands-free arayüz ve telefon tabanlı operasyon otomasyonu açısından önemli bir `enabling layer`.
- Özellikle saha raporlama, dispatch, malzeme siparişi, teknisyen check-in/out gibi use case'lerde benzer teknik yığının inşaata uygulanabileceğini gösteriyor.

**Sinyal**

- Resmi sitede no-code kurulum, 30+ dil, real-time booking, sentiment analysis ve automation vurgulanıyor.

**Risk / sınırlama**

- Construction vertical'e özel ürünleşme işareti zayıf.
- Bu nedenle bugün için bir `construction AI winner` değil, daha çok sesli arayüz altyapısı örneği.

## 2. YZ-Native CAD Trendi

Buradaki ana fikir şudur: AI, CAD/BIM'e sonradan eklenen bir yardımcı değil; modelin, komponentlerin, doğrulama mantığının ve otomasyonun veri yapısına baştan işlenmiş olduğu yeni nesil authoring ortamı.

### Bu trendin temel özellikleri

- `Natural language -> deterministic action`
- `Component intelligence`: objenin sadece geometri değil, kural ve metadata da taşıması
- `Validation in the loop`: hata kontrolünün dış QA süreci değil, edit akışının parçası olması
- `Python/SDK native automation`
- `Version control / branch / merge` mantığının modele uygulanması
- `Cloud collaboration` ve file-locking'siz çalışma

### Bu trendi kim temsil ediyor

- `ArchiLabs`: en güçlü saf örnek. Mevcut anlatısı doğrudan AI-native CAD.
- `Clev`: authoring kadar control/compliance katmanında.
- `BIMLOGIQ`: AI-native CAD'den çok AI-native Revit workflow.

### Neden önemli

- Revit eklentileri bugün değer üretir; ama oyun değiştirici katman authoring ortamının kendisi olabilir.
- Uzun vadede kazanan ürün, "komut alan AI" değil, "tasarım kurallarını veri modeli içinde çalıştıran AI-native model sistemi" olabilir.

### AkOs açısından çıkarım

- Sadece chat arayüzü yapmak yeterli değil.
- Değer, `yapı elemanları + iş kuralı + saha/tedarik/veri bağlamı` birleştiğinde oluşuyor.
- Yani AI-native CAD benzeri düşünce, salt tasarım ekranı değil, `AI-native project model` olarak yorumlanmalı.

## 3. Sesle Saha Raporlama Trendi

Bu alan hızlanıyor, çünkü saha çalışanı için klavye ve form doğal arayüz değil. Eldiven, hareket halinde çalışma, gürültü, zaman baskısı ve düşük bağlantı kalitesi nedeniyle ses çok daha doğal bir giriş katmanı.

### Gözlenen patern

- `Voice note -> structured report`
- Fotoğraf + ses + zaman damgası + konum birleşimi
- Template'lere otomatik doldurma
- Günlük rapor, snag list, inspection, safety log, shift update gibi tekrar eden şablonlara uyarlama

### Örnek sinyaller

- `OpenSpace`: yürürken note alma ve lokasyona otomatik pinleme.
- `Kraaft`: inşaat sahasında voice ile rapor doldurma.
- `ConstructLog`, `SiteVoice`, `ProStroyka`, `Cogram Field Reports`: doğrudan "voice-to-report" anlatısı.
- `Awaz.ai`: dikey dışı olsa da voice agent altyapısının ne kadar hızlı paketlenebildiğini gösteriyor.

### Bu trend neden önemli

- Saha verisinin sisteme girmemesi, çoğu zaman veri üretilememesinden değil, giriş sürtünmesinden kaynaklanıyor.
- Ses, bu sürtünmeyi ciddi biçimde düşürüyor.
- Ama tek başına transcription yetmez; asıl değer `yapısal rapor`, `olay çıkarımı`, `iş akışı tetikleme` ve `denetim izi`.

### AkOs açısından çıkarım

- "Ses notunu yazıya çevir" düşük seviye özellik.
- Ürün seviyesi fırsat: `söylenenleri proje bağlamı ile normalize edip günlük rapora, issue'ya, gecikme nedenine, malzeme ihtiyacına veya taşeron aksiyonuna bağlamak`.

## 4. İstihbarat Katmanı Yaklaşımı

Burada "istihbarat katmanı" ile kastettiğim şey, AI'nin kullanıcıyla tek tek sohbet eden asistan olmaktan çıkıp dağınık saha, çizim, plan, maliyet ve iletişim verisini karar alınabilir hale getiren bir üst katman haline gelmesi.

### Bu yaklaşımın belirtileri

- Farklı veri kaynaklarını bağlama
- Ham görsel/doküman verisini indeksleme
- Sadece arama değil, `sapma`, `risk`, `öncelik`, `next step` üretme
- İş akışı içinde görünme: RFI, submittal, field issue, progress, budget, procurement

### Kimler güçlü örnek

- `OpenSpace`: "Visual Intelligence Platform" ifadesini doğrudan kullanıyor.
- `Buildots`: progress telemetry + delay prediction + performance management.
- `Procore AI`: parçalı veriyi `system of intelligence` olarak çerçeveliyor ve connector/agent katmanı inşa ediyor.

### Neden önemli

- Tekil AI özellikleri kolay kopyalanır.
- Kalıcı savunma hattı çoğu zaman `veri ağı + workflow embedding + karar desteği` birleşimidir.
- Bu nedenle geleceğin kazananları çoğunlukla "AI feature" satanlar değil, `intelligence layer` kuranlar olacak.

### AkOs açısından çıkarım

- Sadece modül bazlı AI eklemek yerine, proje boyunca akan veriyi birleştiren bir yorumlama katmanı kurmak daha güçlü olabilir.
- Özellikle saha raporu, procurement, fit-out paketleri, tasarım revizyonu ve taşeron koordinasyonunun tek bağlamda okunması önemli.

## 5. Perakende Fit-Out Nişinde AI Kullanan Platform Var mı?

Kısa cevap: `Evet, ama çoğu yatay çözümün niş uyarlaması şeklinde.` Tam uçtan uca, retail fit-out'a özgü, güçlü biçimde kategorileşmiş bir platform henüz çok görünür değil.

### Gördüğüm örnekler

- `Downtobid`: YC sayfasında özellikle retail proje yapan GCler için intro çağrısı yapıyor. Bu, ürünün perakende fit-out bid orchestration tarafında kullanılabildiğini gösteriyor.
- `Togal.AI`: FF&E ve trade kırılımları nedeniyle retail/interior fit-out takeoff tarafına rahat oturuyor.
- `qbiq`: test-fit, layout generation ve build-out görselleştirme. Özellikle tenant/owner/construction köprüsünde güçlü.
- `laiout`: office odaklı olsa da build-out öncesi layout üretimi, 3D görselleştirme ve leasing akışına oturuyor.
- `ProQsmart`: interior fit-out için AI-powered procurement çözümü sunuyor.
- `Upbuild`: commercial door & hardware estimate/submittal katmanında mikro-dikey örnek.
- `Buildots` ve `OpenSpace`: retail'e özel değil, ama fit-out fazında ilerleme ve kalite kontrol için güçlü yatay altyapı.

### Bu pazarda henüz boş olan şey

Tek üründe şu akışı birleştiren güçlü bir oyuncu görünmüyor:

- mağaza konsepti / guideline okuma
- test-fit / layout üretimi
- FF&E + finish takeoff
- paketleme ve tedarik
- saha ilerleme / snag / handover
- zincir mağaza rollout yönetimi

### Sonuç

- Retail fit-out AI pazarı `var`, fakat daha çok `point solution mosaic` halinde.
- Bu nedenle burada halen ürünleşme fırsatı yüksek.
- Özellikle çok lokasyonlu rollout, marka standardı, hızlı varyasyon, tedarik koordinasyonu ve saha kapanışını tek akışta birleştiren ürün boşluğu dikkat çekiyor.

## 6. Stratejik Sonuçlar

## En dikkat çekici yükselen kümeler

1. `AI-native / AI-assisted BIM-CAD`
2. `Preconstruction intelligence`
3. `Visual / jobsite intelligence`
4. `Voice-first field data capture`
5. `Procurement and quote intelligence for fit-out and specialty trades`

## En umut verici oyuncular

- `ArchiLabs`: en iddialı gelecek tezi.
- `Togal.AI`: en net ticari wedge'lerden biri.
- `Downtobid`: çizim anlama -> teklif orkestrasyonu hattında güçlü.
- `OpenSpace`: veri ağı ve platform mantığı nedeniyle çok stratejik.
- `Buildots`: karar desteği ve performans takibi tarafında kuvvetli.

## Daha yakından izlenmesi gerekenler

- `Clev`: compliance/control layer yönü nedeniyle.
- `BIMLOGIQ`: dokümantasyon otomasyonu ve Revit içinde gerçek kullanım nedeniyle.
- `Awaz.ai`: doğrudan rakip değil; ama sesli operasyon katmanı için referans teknoloji.

## AkOs için en anlamlı tez

AkOs benzeri bir ürün için en güçlü pozisyon, tekil bir AI özellik satmak değil; `retail fit-out / saha operasyonu / procurement / design coordination` boyunca çalışan bir `domain intelligence layer` kurmak olabilir. Bunun üstüne de `voice-first field capture` ve `fit-out-native workflow memory` eklenirse, yatay oyuncuların tam çözmediği alan yakalanabilir.

## Kaynaklar

### Şirket siteleri ve resmi ürün sayfaları

- ArchiLabs ana sayfa: <https://archilabs.ai/>
- ArchiLabs YC profili: <https://www.ycombinator.com/companies/archilabs>
- BIMLOGIQ ana sayfa: <https://bimlogiq.com/>
- BIMLOGIQ About: <https://bimlogiq.com/about>
- BIMLOGIQ Smart Annotation: <https://bimlogiq.com/product/smart-annotation>
- Clev ana sayfa: <https://www.getclev.com/>
- Downtobid ana sayfa: <https://downtobid.com/>
- Downtobid YC profili: <https://www.ycombinator.com/companies/downtobid>
- Togal.AI ana sayfa: <https://www.togal.ai/>
- Togal.AI About: <https://www.togal.ai/about>
- Togal help center: <https://help.togal.ai/how-to-use-togal-automated-takeoff>
- Buildots ana sayfa: <https://buildots.com/>
- OpenSpace ana sayfa: <https://www.openspace.ai/>
- OpenSpace Capture: <https://www.openspace.ai/products/capture/>
- Procore AI: <https://www.procore.com/en/ai>
- Awaz.ai ana sayfa: <https://www.awaz.ai/>

### Retail fit-out ve ses trendi için ek kaynaklar

- qbiq for Architecture and Construction: <https://www.qbiq.ai/solutions/architects-construction>
- laiout: <https://laiout.co/>
- ProQsmart interior fit-out: <https://proqsmart.com/interior-fit-out/>
- Upbuild: <https://getupbuild.com/>
- Kraaft reports by voice: <https://www.kraaft.com/en/features/reports>
- ConstructLog: <https://constructlog.co/>
- SiteVoice: <https://sitevoice.app/>
- Cogram field reports: <https://www.cogram.com/field-reports>

### Yardımcı analiz / ekosistem okuması

- Levery, AI as a Copilot for Construction: <https://www.levery.it/ai-as-a-copilot-for-construction-actors-stakeholders>
