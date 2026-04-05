# Rakip Analizi Detay

Bu dokuman, 5 Nisan 2026 tarihinde public ve agirlikla resmi kaynaklar uzerinden hazirlandi. Odak, AkOs ile dogrudan temas eden insaat odakli AI urunleri ve platformlari: Procore Copilot/Assist, Autodesk Assistant, ALICE Technologies, nPlan ve Karmen.

Notlar:

- "Procore Copilot" urunu 20 Haziran 2025 itibariyla "Procore Assist" olarak yeniden adlandirildi.
- Bazi urunlerde public fiyat listesi yok. Bu durumlarda "custom quote / contact sales" seklinde isaretlendi.
- "Turkiye'de kullanimi" basliginda lokal dil, veri bolgesi, partner/yayinlanmis musteri referansi ve urunun saha gercegine uygunlugu birlikte degerlendirildi.
- Public kaynakta bulunamayan noktalar acikca belirtildi.

## Kisa Ozet Tablosu

| Urun | Fiyatlandirma modeli | Hedef pazar | AI yaklasimi | Dil destegi | Turkiye uygunlugu | Ana zayif nokta |
|------|----------------------|-------------|--------------|-------------|-------------------|-----------------|
| Procore Assist | Yillik, urun bazli, ACV tabanli; AI icin public net fiyat yok | Orta-buyuk GC, owner, specialty contractor | Sidebar + global search + module-contextual chat | Procore UI 13+ dil; Assist icin acikca Ispanyolca ve Lehce, genisleme suruyor | Orta | Cok guclu ama chat-first degil; Procore verisine kilitli |
| Autodesk Assistant | ACC bundle/urun aboneligi icinde; quote bazli; standalone AI fiyat yok | ACC kullanan GC, owner, subcontractor, design-build ekipleri | Embedded assistant + prompt library + chat history | ACC'nin destekledigi tum diller | Orta-yuksek | Guclu ekosistem, fakat AI deneyimi parca parca ve ACC baglamina bagli |
| ALICE Technologies | Token-based pricing; public rakam yok | Buyuk ve karmaik projeler, infra/industrial/commercial | Embedded optimization; chat ikinci planda | Resmi olarak sadece Ingilizce | Dusuk-orta | Chat-first degil; agir scheduler/planner kullanimi gerektiriyor |
| nPlan | Urun bazli quote; bazi araclar ucretsiz | Project controls, risk, owner/contractor, megaproject ekipleri | Hybrid: predictive engine + Barry chat | Public net dil listesi yok; urun copy'si Ingilizce | Orta | Risk/forecast cok guclu, operasyonel gunluk is akislarinda daha zayif |
| Karmen | Public fiyat yok; demo/pilot odakli | Scheduler, PM, owner/GC; P6/MS Project kullanan ekipler | Scheduling copilot; chat embedded | Public dil listesi yok | Orta | Dar kapsamli ve erken asama; yatay ERP/workflow derinligi zayif |

## 1. Procore Assist

## Konumlandirma

Procore Assist, Procore'un mevcut construction management platformuna gomulu konusmali AI kati. Uygulama icinde global search ve yan panel uzerinden calisiyor; kullaniciya proje belgeleri, tool verileri ve raporlama baglaminda hizli cevaplar veriyor. Procore'un AI transparency sayfasi, Assist tarafinda OpenAI GPT-5.1 kullandigini ve bunun Procore Helix uzerinde sunuldugunu gosteriyor.

## Fiyatlandirma modeli

- Procore'un genel modeli yillik, urun bazli ve Annual Construction Volume (ACV) tabanli.
- Procore, "upfront annual fee by product and based upon ACV" modelini resmi olarak acikliyor.
- Assist icin public sayfada net bir seat veya token fiyat yok; urun sayfasi "see pricing" ve "request a demo" ile satiyor.
- Sonuc: Procore'da AI ayrik bir self-serve SaaS degil; ana platform sozlesmesinin icinde veya ona bagli bir upsell/add-on gibi konumlaniyor.

## Hedef pazar

- Genel muteahhitler
- Specialty contractor'lar
- Owner/operator ekipleri
- Zaten Procore'u "system of record" olarak kullanan orta-buyuk olcekli ekipler

Bu urun, ozellikle Procore icinde ciddi belge yogunlugu, RFI/submittal/daily log trafigi ve raporlama ihtiyaci olan organizasyonlarda deger uretiyor.

## AI yaklasimi

- Chat-first degil.
- "Sidebar + contextual assistant" modeli.
- Global search bar ve side panel uzerinden cagirilabiliyor.
- Modul baglamini biliyor; bu nedenle "embedded conversational layer" demek daha dogru.

Bu, AkOs icin kritik farklardan biri: Procore'da chat, ana urun paradigmasi degil; mevcut modullerin uzerine bindirilmis hizlandirici katman.

## Desteklenen diller

- Procore web uygulamasi resmi olarak 13 dil destekliyor.
- Procore Assist sayfasi, Assist'in Ispanyolca ve Lehce destekledigini ve dil kapsaminin genisledigini acikca soyluyor.
- Procore'un Conversations araci icin Turkce otomatik ceviri destekleniyor; ancak bu, Assist'in Turkce conversational support verdigi anlamina gelmiyor.

Degerlendirme: Procore'un genel lokalizasyon kaslari guclu, fakat Assist'in Turkce destek verdigine dair public bir ifade bulamadim.

## Turkiye'de kullanimi

- Teknik olarak kullanilabilir; Procore 150+ ulkede hizmet verdigini soyluyor.
- EMEA destek saatleri var.
- Turkce UI ve Turkce Assist destegi public kaynakta teyit edilemedi.
- 5 Nisan 2026 itibariyla public kaynaklarda Turkiye'ye ozgu Procore musteri referansi veya belirgin TR GTM materyali tespit edemedim.

Yorum: Turkiye'de buyuk uluslararasi GC/owner yapilarinda kullanilabilir, fakat yerel onboarding, dil, sozlesme ve saha adaptasyonu tarafinda dogal avantaji sinirli gorunuyor.

## Entegrasyon ekosistemi

- 500+ entegrasyonlu Procore App Marketplace
- Open API ve partner ekosistemi
- ERP ve enterprise entegrasyonlari icin guclu partner modeli

Bu, Procore'un en net savunma hatti. AI tek basina degil, platform + ecosystem leverage ile satiliyor.

## Zayif noktalar

- AI deneyimi Procore verisiyle sinirli; cross-system intelligence iddiasi ek entegrasyon olmadan zayif kalir.
- Chat, sistemin birincil UX'i degil; kullanici halen modul gezisi yapar.
- Fiyatlandirma seffaf degil.
- Turkce/yerel saha odakli adoption hikayesi zayif.
- SMB ve "hizli kurulum" segmentine gore agir.

## AkOs ile fark analizi

- AkOs icin firsat: Procore'dan farkli olarak chat'i "yardimci panel" degil, ana komut arayuzu yapmak.
- AkOs icin firsat: sadece veri bulmak degil, veri uzerinde is yapmak; onay, olusturma, guncelleme ve takip islerini chat icinden yonetmek.
- AkOs icin firsat: Turkce-first ve yerel saha dili/terimlerine uygun deneyim.
- AkOs icin risk: Procore'un platform derinligi ve entegrasyon savunmasi cok guclu; yalniz chat UX ile yenilmez.

## Kaynaklar

- https://www.procore.com/pricing
- https://www.procore.com/assist
- https://www.procore.com/offer/demo/procore-assist
- https://support.procore.com/products/online/user-guide/project-level/assist
- https://support.procore.com/faq/what-languages-are-available-in-procore
- https://support.procore.com/faq/what-languages-can-be-automatically-translated-in-the-conversations-tool
- https://www.procore.com/about
- https://transparency.procore.com/
- https://mkt-cdn.procore.com/downloads/Procore-Corporate-Fact-Sheet.pdf

## 2. Autodesk Assistant

## Konumlandirma

Autodesk Assistant, Autodesk Construction Cloud (ACC) icindeki AI destekli asistan katmani. Autodesk bunu "AI-powered assistance directly where your teams work" diye konumluyor. Yardimci, ACC icindeki specs/docs/takeoff/build akislarina gomulu; prompt library ve chat history sunuyor.

Burada onemli nokta su: Autodesk'in AI hikayesi tek bir asistandan ibaret degil. Assistant, Construction IQ, AutoSpecs, photo autotags, symbol detection, bid forwarding gibi parca parca AI yeteneklerinin bir parcasi.

## Fiyatlandirma modeli

- ACC urunleri quote bazli bundle ve urun bazli fiyatlandiriliyor.
- Autodesk Construction Cloud pricing sayfasi "multiple solutions, one price" ve account/project/user bazli esnek model vurgusu yapiyor.
- Public tarafta Autodesk Assistant icin ayrik bir fiyat yok.
- Mayis 2025 whats-new notu, Assistant'in dil genislemesinin Enterprise Business Agreement veya Account Unlimited Agreement musterilerine acildigini belirtiyor.

Sonuc: Assistant, buyuk olasilikla ana ACC sozlesmesinin icindeki bir capability; standalone AI seat olarak satilmiyor.

## Hedef pazar

- ACC kullanan genel muteahhitler
- Owner ve owner-rep ekipleri
- Specialty contractor'lar
- Design-build ve BIM agirlikli organizasyonlar

Ozellikle Autodesk Docs, Build, Takeoff ve Specifications araclarini aktif kullanan ekiplerde degeri yuksek.

## AI yaklasimi

- Chat-first degil.
- "Embedded assistant" modeli.
- Specs, Docs, Build, Takeoff icinde ilgili baglamda devreye giriyor.
- Prompt library, kaydedilebilir prompt'lar ve chat history sunuyor.

Bu, Procore'a gore biraz daha derli toplu conversational katman sunuyor; ama yine de urun paradigmasi sohbet degil, ACC modullerinin icindeki AI hizlandiricisi.

## Desteklenen diller

- Autodesk resmi olarak Assistant'in ACC'nin destekledigi tum dillerde calistigini belirtiyor.
- ACC unified products icin desteklenen diller: Chinese Simplified/Traditional, Czech, Danish, Dutch, English UK/US, French, Canadian French, German, Italian, Japanese, Korean, Norwegian, Polish, Spanish, Swedish.
- Turkce listede yok.

Yorum: Coklu dil kapsami Procore Assist'ten daha net; ancak Turkce lokalizasyon eksigi Turkiye acisindan hala ciddi.

## Turkiye'de kullanimi

- Autodesk Partner Finder uzerinde Turkiye partner agi mevcut.
- Autodesk tarafinda Istanbul merkezli FATI Group icin Autodesk Construction Cloud basari hikayesi mevcut.
- Avrupa veri bolgesi ve birden fazla ACC region secenegi bulunuyor.
- Turkce Assistant destegi yok.

Yorum: Turkiye'de kurumsal satis ve partner kanali en gercekci rakiplerden biri Autodesk. Dilde eksik, ama ekosistem ve marka gucu bunu kismen telafi ediyor.

## Entegrasyon ekosistemi

- Autodesk AECO Technology Partner Ecosystem
- 174+ entegrasyon sonucu gosterilen genis partner katmani
- ACC Connect ile no-code workflow/integration
- APS (Autodesk Platform Services) ile gelistirici ekosistemi

Ekosistem genisligi, Autodesk'in en buyuk artisi. AI bir moduldense, platform + API + partner bilesiminin parcasi.

## Zayif noktalar

- Deneyim moduller arasinda daginik; kullanici tek bir "AI operating system" hissi almiyor.
- Turkce yok.
- Fiyatlandirma ve AI erisim kosullari net degil.
- ACC icinde olmayan veriye dair anlam katmani dogal olarak sinirli.
- Chat ile transaction/action tam derin degil; ozetleme ve erisim daha guclu, is yaptirma daha zayif.

## AkOs ile fark analizi

- AkOs, Autodesk'e gore "tek sohbetten coklu workflow" vaadini daha net kurabilir.
- Autodesk veri ve entegrasyon derinligiyle guclu; AkOs'un bunu yenmesi icin sadece sohbet degil, gercek operasyon akisi lazim.
- AkOs'un en net ayrismasi: Turkce-first, saha-yonetim ve islem/aksiyon agirlkli conversational UX.
- Autodesk'in gucu design-to-build continuum; AkOs'un gucu field/ops ve ERP benzeri operasyon katmaninda olabilir.

## Kaynaklar

- https://www.construction.autodesk.com/workflows/artificial-intelligence-construction/
- https://help.autodesk.com/cloudhelp/ENU/Docs-About-ACC/files/Supported_Languages.html
- https://construction.autodesk.com/acc-faq/
- https://construction.autodesk.com/pricing/
- https://help.autodesk.com/cloudhelp/ENU/Docs-Whats-New/files/may-25/Takeoff_Whats_New_May_25.html
- https://www.autodesk.com/integrations
- https://help.autodesk.com/cloudhelp/ENU/ACCC-Test-Folder-2/files/What-is-Connect.html
- https://www.autodesk.com/tr/partners/locate-a-reseller
- https://www.autodesk.com/support/partners/success-stories/pre-construction-phase-with-autodesk-construction-cloud/9978

## 3. ALICE Technologies

## Konumlandirma

ALICE, "construction optioneering" kategorisinin liderlerinden biri. Esas degeri sohbet etmek degil; onbinlerce/milyonlarca schedule senaryosunu simule edip daha iyi sure, isgucu ve ekipman kombinasyonlari onermek. 2024'te ALICE Core ile Primavera/Oracle scheduling urunlerinden schedule import eden daha erisilebilir bir urun cikardi. Mevcut urun ailesi esasen ALICE Core, ALICE Pro ve 2025'te cikmis ALICE Plan etrafinda duruyor.

## Fiyatlandirma modeli

- 2024 itibariyla resmi olarak token-based pricing modeline gecti.
- Public fiyat tablosu yok.
- Satis modeli demo/contact us odakli.

Bu model, scheduler/planner ekipleri icin "her projede lisans yakma" mantigini yumusatabilir; ama budget predictability konusunda disaridan netlik dusuk.

## Hedef pazar

- Buyuk genel muteahhitler
- Buyuk owner/asset owner ekipleri
- Infrastruktur, industrial ve commercial segmentleri
- BIM veya Primavera merkezli planning ekipleri

ALICE'in sweet spot'u buyuk ve karmasik projeler. Gunluk saha operasyonundan ziyade preconstruction, re-baselining, resequencing ve optimization tarafinda kuvvetli.

## AI yaklasimi

- Chat-first degil.
- "Embedded optimization engine" modeli.
- Kullanici schedule yukler, parametre tanimlar, what-if kosullari kurar, ALICE senaryo uretir.
- ALICE Plan tarafinda gorsel planlama canvasi var; yine de ana metafor sohbet degil.

Bu urun, AkOs'a gore bir "co-pilot"tan cok "simulation/optimization workbench".

## Desteklenen diller

- Resmi knowledge base maddesine gore platformun resmi destekledigi tek dil Ingilizce.
- Diger diller icin ucuncu parti tarayici cevirisi oneriliyor.

Bu, Turkiye acisindan belirgin bir zayiflik.

## Turkiye'de kullanimi

- Public kaynaklarda Turkiye musteri referansi bulamadim.
- UK/EU musterileri icin yerel veri saklama altyapisi duyurulmus; bu Avrupa yakinligi acisindan olumlu.
- Ancak dil, GTM ve referans tarafinda Turkiye'ye ozgu bir iz goremedim.

Yorum: Teknik olarak buyuk EPC/infra oyuncularinda kullanilabilir; fakat Turkiye'de yayginlasmasi icin dil ve partner katmani zayif.

## Entegrasyon ekosistemi

- Oracle Primavera P6
- Oracle Primavera Cloud
- Microsoft Project
- BIM model tabanli workflow'ler
- Schedule Sync ile guncel schedule merge etme

Ekosistem var ama Procore veya Autodesk kadar yatay degil. ALICE entegrasyonlari planlama cevresinde yogun.

## Zayif noktalar

- Chat-first degil; planner uzmanligi gerektiriyor.
- Operasyonel saha akislari icin fazla analitik/uzman araci gibi kalabilir.
- Resmi dil destegi yalnizca Ingilizce.
- Public fiyat seffafligi dusuk.
- KOBI veya orta olcekli muteahhitler icin adoption bariyeri yuksek olabilir.

## AkOs ile fark analizi

- AkOs, ALICE'e gore daha genis operasyonel is akislarini chatten yurutme sansina sahip.
- ALICE, optimizasyon motorunda cok guclu; AkOs'un burada yarismasi gerekmez.
- Dogru konumlandirma: "ALICE schedule'i optimize eder; AkOs ekiplerin gunluk isini, koordinasyonunu ve karar akislarini sohbetten yonetir."
- AkOs, ALICE benzeri derin schedule optioneering yerine daha hizli onboarding, Turkce deneyim ve rol-bazli is akislari ile fark yaratabilir.

## Kaynaklar

- https://www.alicetechnologies.com/
- https://blog.alicetechnologies.com/news/alice-technologies-expands-platform-and-target-market-with-launch-of-alice-core
- https://blog.alicetechnologies.com/introducing-alice-core
- https://blog.alicetechnologies.com/key-update-for-microsoft-project-users
- https://support.alicetechnologies.com/hc/en-us/articles/26443717899543-Language-Support
- https://support.alicetechnologies.com/hc/en-us/articles/29475189914135-Schedule-Sync
- https://support.alicetechnologies.com/hc/en-us/articles/21237989571863-Import-P6
- https://support.alicetechnologies.com/hc/en-us/articles/21994041529111-Import-Microsoft-Project
- https://blog.alicetechnologies.com/news/alice-launches-local-data-storage
- https://www.alicetechnologies.com/about

## 4. nPlan

## Konumlandirma

nPlan, klasik construction copilot kategorisinden biraz farkli. Ana urun degeri, 750.000+ tarihsel schedule ve proprietary ML modelleriyle risk tahmini, forecast, schedule integrity ve report generation. Barry ise bu cekirdegin uzerine gelen conversational AI katmani.

Yani nPlan'in merkezi "chat" degil; merkezi "predictive project controls". Chat bunu erisilebilir hale getiriyor.

## Fiyatlandirma modeli

- Insights Pro, Portfolio, Schedule Studio ve AutoReport gibi urunler contact sales / trial modeliyle satiliyor.
- Public net lisans rakami yok.
- Schedule Integrity Checker resmi olarak tamamen ucretsiz.
- AutoReport sayfasi, pricing bilgisinin satis ekibince iletildigini acikca belirtiyor.

Sonuc: nPlan'in ticari modeli enterprise/project controls satisi; dusuk friksiyonlu self-serve chat urunu degil.

## Hedef pazar

- Project controls ekipleri
- Risk manager ve planner'lar
- Buyuk owner ve contractor organizasyonlari
- Rail, utilities, energy, infra ve diger capital projects

Public referanslar Shell, Chevron, MTR, NEOM gibi buyuk yapilari gosteriyor. Bu, nPlan'in "megaproject intelligence" tarafina konumlandigini netlestiriyor.

## AI yaklasimi

- Hybrid model.
- Cekirdekte predictive AI ve generative schedule/risk modelleri var.
- Uzerinde Barry isimli open-ended chat / assistant kati bulunuyor.
- Barry bazen serbest chat, bazen feature-embedded augmented assistant olarak calisiyor.

Bu, AkOs icin onemli bir benchmark: nPlan chat'i tek UX olarak degil, derin domain modellerine erisim kapisi olarak kullaniyor.

## Desteklenen diller

- Public sayfalarda net bir supported languages listesi bulamadim.
- Tum urun sayfalari ve Barry materyalleri Ingilizce.
- Turkce veya lokal dil destegine dair bir ibare goremedim.

Degerlendirme: Public veriye dayanarak Ingilizce-oncelikli bir urun oldugu sonucuna varmak makul.

## Turkiye'de kullanimi

- Public Turkiye musteri referansi bulamadim.
- Orta Dogu yayilimi ve NEOM gibi bolgesel referanslar mevcut.
- Browser tabanli ve P6/Powerproject/MS Project uyumlu oldugu icin teknik kullanim bariyeri dusuk.
- Fakat Turkce dil, yerel partner ve Turkiye merkezli GTM izine rastlamadim.

Yorum: Turkiye'de buyuk proje controls ekipleri icin kullanilabilir; genele yayilan saha/operasyon araci olmaktan uzak.

## Entegrasyon ekosistemi

- Oracle Primavera
- Powerproject
- Microsoft Project Plan
- Power BI
- Tableau
- Risk register ve cesitli belge formatlari

Ekosistem, operasyon platformlarindan cok planning/reporting stack'i etrafinda.

## Zayif noktalar

- Gunluk saha operasyonundan cok project controls ve risk fonksiyonuna hitap ediyor.
- Chat, ana urun olmaktan ziyade analytical layer ustune eklenmis.
- Public fiyat seffafligi dusuk.
- Lokal dil hikayesi zayif.
- Proje icindeki onay, gorev, ekip koordinasyonu gibi transaction-heavy akislar nPlan'in merkezi degil.

## AkOs ile fark analizi

- AkOs, nPlan'a gore daha yatay ve operasyonel olabilir.
- nPlan'in gucu risk forecasting ve schedule intelligence; AkOs'un gucu ise team coordination, workflow execution ve chat-first ops olabilir.
- Dogru konumlandirma: "nPlan gelecekteki gecikmeyi tahmin eder; AkOs bugun kim ne yapacak, ne onaylanacak, ne takip edilecek onu sohbetten yurutur."
- Uzun vadede entegrasyon firsati da var: AkOs operasyon katmani, nPlan ise risk intelligence kaynagi olabilir.

## Kaynaklar

- https://www.nplan.io/
- https://www.nplan.io/products/barry
- https://www.nplan.io/products/insights-pro
- https://www.nplan.io/products/insights-core
- https://www.nplan.io/products/schedule-studio
- https://www.nplan.io/products/autoreport
- https://www.nplan.io/products/schedule-integrity-checker
- https://www.nplan.io/blog-posts/nplan-insights-pro-and-nplan-portfolio-now-integrate-with-power-bi
- https://www.nplan.io/press-releases/nplan-raises-16m-series-b-to-scale-its-ai-led-transformation-of-capital-project-delivery
- https://www.nplan.io/nerd

## 5. Karmen

## Konumlandirma

Karmen, listedeki en dar ama en "copilot" benzeri urunlerden biri. Ana vaadi: project documents'tan baseline schedule uretmek, degisiklik geldikce schedule update onermek, fragnet ve time-impact narrative taslagi olusturmak. Erken asama ve cok net bir problem etrafinda sekillenmis: scheduler/PM'in mail, degisiklik ve schedule guncelleme yukunu azaltmak.

## Fiyatlandirma modeli

- Public fiyat yok.
- Satis modeli "Book a Demo" odakli.
- Public self-serve veya transparent plan yapisi goremedim.

Yorum: Muhtemelen pilot/enterprise odakli erken-asama satis modeli.

## Hedef pazar

- Construction project manager'lar
- Scheduler'lar
- Owner ve general contractor ekipleri
- P6 veya Microsoft Project ile calisan planlama ekipleri

Karmen'in landing page'i, dogrudan scheduling workflow'unu hedefliyor; genel construction OS degil.

## AI yaklasimi

- "AI Copilot for Scheduling"
- Dokuman yukleme + natural language ile baseline uretme
- Change event geldiginde otomatik update onerme
- Approved updates'i P6 veya Microsoft Graph API uzerinden itme

Bu urun, chat-first'e en yakin rakiplerden biri gibi gorunse de aslinda chat'i genel isletim sistemi olarak degil, schedule editing interface'i olarak kullaniyor.

## Desteklenen diller

- Public supported languages listesi bulamadim.
- Landing page ve mevcut deneyim tamamen Ingilizce.
- Turkce veya coklu dil destegine dair ibare tespit edemedim.

## Turkiye'de kullanimi

- Public Turkiye referansi bulamadim.
- Lokal partner, veri bolgesi veya Turkce destek izi goremedim.
- Ancak schedule odakli oldugu ve P6/MS Project ile calistigi icin buyuk projelerde teknik olarak denenebilir.

Yorum: Kullanilabilir, fakat yerel uyum ve kurumsal guven katmani henuz erken.

## Entegrasyon ekosistemi

- Primavera P6
- Microsoft Project
- Microsoft Graph API
- Email
- Construction management tools ifadesi var; fakat public sayfada acik entegrasyon listesi sinirli

Ekosistem vaadi var, ama public olarak kanitlanan entegrasyon derinligi henuz dar.

## Zayif noktalar

- Kapsam dar; scheduling disindaki workflow'lerde zayif.
- Erken asama urun hissi veriyor.
- Public fiyat, dil ve kurumsal deployment bilgisi sinirli.
- Genis entegrasyon ve platform savunmasi henuz net degil.
- AkOs gibi "tek sohbetten tum operasyon" pozisyonuna cikmis degil.

## AkOs ile fark analizi

- Karmen scheduling copilot; AkOs daha genis operasyon copilot/OS olabilir.
- Karmen'in en guclu yani dar problemde net ROI; bu, AkOs icin ders: ilk wedge cok net olmali.
- AkOs, Karmen'den farkli olarak sadece schedule degil, onay, satin alma, saha notu, belge sorulari, ekip koordinasyonu gibi yatay akislar sunabilir.
- Karmen'in dar ama somut degeri, AkOs'un da "ilk giris noktasi" secmesi gerektigini gosteriyor.

## Kaynaklar

- https://www.karmenai.com/
- https://www.ycombinator.com/launches/MCy-karmen-the-ai-assistant-for-construction-project-managers

## 6. AkOs Icin Toplu Fark Analizi

## Rakiplerin ortak paterni

Bu besli icinde net bir ortak desen var:

- Buyuk platformlar AI'yi mevcut modullere gomuyor.
- Derin planning/risk urunleri AI'yi uzman workflow'lerin uzerine ekliyor.
- Hicbiri gercek anlamda "chat-first construction operating system" haline gelmis degil.

Bu, AkOs icin bosluk demek. Ama bu bosluk sadece "chat pencereci" ile dolmaz. Chat'in sistemin ana eylem katmani olmasi gerekir.

## AkOs'un anlamli ayrisma alanlari

### 1. Chat-first, ama action-first

Rakiplerin cogunda chat bilgi bulur, ozetler, bazen draft uretir. AkOs farki, sohbetten dogrudan is yaptirmak olmali:

- "A blok icin geciken satin alma kalemlerini cikar"
- "Bunlari tedarikciye gore grupla"
- "Ilk 5 kritik kalem icin satin alma sorumlusuna gorev ac"
- "Yarin 09:00 toplanti notuna ekle"

Yani AkOs, bilgi erisimi + workflow execution kombinasyonu kurmali.

### 2. Turkce-first ve saha dili

Rakiplerin hicbirinde Turkce, sahadaki dogal kullanim dili olarak net avantaj degil. Bu, AkOs icin gercek bir wedge:

- Turkce serbest komut
- Insaat jargonu
- Karisik dil kullanimi
- Sesli kullanim ve mobil saha senaryolari

### 3. Cross-module memory

Rakiplerin cogu kendi modulu veya kendi veri katmani icinde guclu. AkOs'un iddiasi su olmali:

- Bir kez soyle
- Sistem baglami hatirlasin
- Farkli modullerde ayni niyeti takip etsin

### 4. Approval-native UX

Insaat operasyonu sadece arama ve ozetleme degil; surekli onay akisidir. AkOs'un farki, sohbet icinde:

- onay
- red
- geri al
- delegasyon
- takip

akislari sunmak olabilir.

### 5. Hizli onboarding

Procore ve Autodesk dev platformlar.
ALICE ve nPlan uzman araclar.
Karmen dar ama erken asama.

AkOs icin en iyi pozisyon: daha hizli kurulan, daha az egitim gerektiren, daha dogal konusulan, daha hizli deger gosteren urun.

## Rakip bazli pozisyonlama cumleleri

- Procore'a karsi: "Moduller arasinda AI yardimi degil, isin kendisini sohbetten yonet."
- Autodesk'e karsi: "Docs/Specs icinde arama degil, tum operasyonu tek komut katmanindan yurur."
- ALICE'e karsi: "Optimizasyon workbench'i degil, ekiplerin gunluk calisma yuzu."
- nPlan'a karsi: "Forecast intelligence degil, execution intelligence."
- Karmen'e karsi: "Scheduling copilot degil, construction ops copilot."

## Stratejik sonuc

AkOs'un dogrudan girmesi gereken bosluk:

- chat-first
- Turkce-first
- mobile/saha-friendly
- approval-native
- action-oriented
- cross-workflow

Eger AkOs yalnizca "rakipler gibi bir AI assistant" yaparsa buyuk platformlar tarafindan kolayca emilir. Eger "insaat operasyonlarinin sohbetten yurutulen calisma sistemi" olursa, daha net ayrisir.

## Sonuc

En guclu rakipler, bugun icin Procore ve Autodesk; cunku platform dagitimi, musteri tabani ve entegrasyon savunmalari yuksek. En derin domain zekasi ALICE ve nPlan tarafinda. En yakin "dar copilot" formu ise Karmen.

AkOs icin dogru oyun alani:

- platform savasini bugun kazanmaya calismak degil
- planning science urunu olmaya calismak degil
- genis ama daginik AI feature set'i yapmak degil

Bunun yerine:

- net wedge secmek
- sohbetten is yaptirmak
- Turkce ve saha gercegine oynamak
- approval ve coordination katmanini sahiplenmek

Bu analizden cikan ana sonuc bu.
