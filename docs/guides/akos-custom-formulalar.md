# AkOs Custom Formulalar

> AkOs icin, mevcut `mol-polecat-work` formulunun workflow stilini referans alarak hazirlanmis 3 ozel formula taslagi.
> Tarih: 5 Nisan 2026

---

## 1. `akos-feature-slice`

Yeni bir feature modulu uctan uca eklemek icin kullanilacak workflow formula.

```toml
description = """
AkOs icin yeni bir feature slice'i uctan uca ekleme workflow'u.

Bu formula, yeni bir ozelligin veri katmani, API, UI, AI entegrasyonu,
testleri ve dokumantasyonunu sirali sekilde ilerletmek icin tasarlanmistir.
Her adim bir onceki adimin ciktilarina dayanir; boylece yari tamamlanmis
ve birbirinden kopuk feature implementasyonlari engellenir.

Ozellikle yeni modullerde schema degisikligi, route, sayfa, tool entegrasyonu
ve testlerin tek bir checklist icinde ilerlemesi hedeflenir.
"""
formula = "akos-feature-slice"
type = "workflow"
version = 1

[[steps]]
id = "schema-migration"
title = "Schema migration hazirla"
description = """
Feature'in ihtiyac duydugu tablo, kolon, index, constraint veya enum
degisikliklerini planla ve SQL migration dosyasini olustur.

Bu adimda hedef, domain modelinin veritabaninda dogru sekilde temsil edilmesi,
geri alinabilir migration mantiginin korunmasi ve mevcut veriyle uyumlulugun
kontrol edilmesidir.

Exit criteria:
- Migration dosyasi yazildi
- Gerekli tablo/alan iliskileri net
- Supabase tarafinda uygulanabilir durumda
"""

[[steps]]
id = "api-route"
title = "API route ekle"
needs = ["schema-migration"]
description = """
Yeni feature icin gerekli server endpoint veya action katmanini ekle.

Bu adimda hedef, UI ve AI tool katmaninin kullanabilecegi stabil bir giris
noktasi tanimlamak; request validation, auth kontrolu, hata yonetimi ve veri
erisimi akisini netlestirmektir.

Exit criteria:
- Route veya handler yazildi
- Input/output sozlesmesi net
- Yetki ve hata durumlari ele alindi
"""

[[steps]]
id = "ui-page"
title = "UI page veya ekranini olustur"
needs = ["api-route"]
description = """
Feature'in kullaniciya gorunen sayfa, ekran veya panelini ekle.

Bu adimda hedef, yeni route'u tuketen net bir UI akis kurmak; loading,
empty-state, error-state ve temel etkilesimleri eksiksiz sekilde saglamaktir.

Exit criteria:
- Sayfa veya ekran render oluyor
- API baglantisi calisiyor
- Temel kullanici akisleri tamam
"""

[[steps]]
id = "ai-tool-integration"
title = "AI tool entegrasyonunu bagla"
needs = ["ui-page"]
description = """
Yeni feature'i AI tool katmanina bagla veya ilgili mevcut tool zincirine entegre et.

Bu adimda hedef, feature'in sadece klasik UI/API ile degil, AkOs'un AI-odakli
kullanim akislarinda da cagrilabilir hale gelmesidir. Tool input/output
eslesmesi, guardrail'ler ve domain sinirlari burada netlestirilir.

Exit criteria:
- Tool entegrasyonu yazildi
- Gerekli schema/mapleme tamam
- Feature AI tarafindan cagirilabilir durumda
"""

[[steps]]
id = "test"
title = "Testleri yaz ve calistir"
needs = ["ai-tool-integration"]
description = """
Feature'in kritik akislarini kapsayan testleri ekle ve calistir.

Bu adimda hedef, migration, API, UI ve tool entegrasyonu boyunca olusan riskli
alanlari regression'a karsi guvenceye almaktir. Gerekirse unit, integration ve
happy-path seviyesinde test kombinasyonu kullan.

Exit criteria:
- Kritik senaryolar test edildi
- Basarisiz test kalmadi
- Yeni feature icin minimum guven seviyesi saglandi
"""

[[steps]]
id = "docs"
title = "Dokumantasyonu guncelle"
needs = ["test"]
description = """
Yeni feature'in nasil calistigini, hangi route'lari kullandigini, hangi
migration'a dayandigini ve AI entegrasyonunun nasil devreye alindigini belgeye dok.

Bu adimda hedef, feature bilgisinin sadece kodda kalmamasi; sonraki
gelistiricilerin veya agent'larin sistemi hizli devralabilmesidir.

Exit criteria:
- Ilgili docs guncellendi
- Kullanim ve sinirlar yazildi
- Takip eden gelistirme icin baglam korundu
"""
```

---

## 2. `akos-tool-creation`

Yeni bir AI tool tanimlamak ve sisteme kaydetmek icin kullanilacak workflow formula.

```toml
description = """
AkOs icin yeni bir AI tool olusturma workflow'u.

Bu formula, yeni tool'un schema tasarimindan runtime execute mantigina,
testlerinden registry kaydina kadar tum parcalarini sirali sekilde toplar.
Amac, tool'larin gelisiguzel degil; ayni kontrat ve kalite cizgisinde
eklenmesini saglamaktir.
"""
formula = "akos-tool-creation"
type = "workflow"
version = 1

[[steps]]
id = "zod-schema"
title = "Zod schema tanimla"
description = """
Tool'un input ve gerekiyorsa output kontratini Zod ile acik sekilde tanimla.

Bu adimda hedef, LLM'den veya uygulama katmanindan gelecek verinin sekil,
zorunlu alan, enum ve dogrulama kurallarini kod seviyesinde netlestirmektir.
Schema once yazilarak execute katmaninin belirsiz veriyle calismasi engellenir.

Exit criteria:
- Input schema yazildi
- Validation kurallari net
- Tool kontrati okunabilir durumda
"""

[[steps]]
id = "execute-function"
title = "Execute function uygula"
needs = ["zod-schema"]
description = """
Tool'un asil is mantigini tasiyan execute fonksiyonunu uygula.

Bu adimda hedef, schema tarafinda garanti altina alinan input'u kullanarak
deterministik, loglanabilir ve hata durumlari acik bir calisma akisi
kurmaktir. Dis servis, DB veya uygulama entegrasyonlari burada toplanir.

Exit criteria:
- Execute fonksiyonu yazildi
- Hata akislari ele alindi
- Beklenen sonuc yapisi donuyor
"""

[[steps]]
id = "test"
title = "Tool testlerini ekle"
needs = ["execute-function"]
description = """
Tool'un schema ve execute davranisini test et.

Bu adimda hedef, gecersiz input, basarili calisma ve beklenen hata
durumlarinin guvence altina alinmasidir. Ozellikle tool'lar AI akislarda
kullanildigi icin kontrat bozulmalarina karsi testler kritik kabul edilir.

Exit criteria:
- Schema validation test edildi
- Execute davranisi test edildi
- Temel hata senaryolari kapsandi
"""

[[steps]]
id = "registry-kayit"
title = "Tool registry kaydini yap"
needs = ["test"]
description = """
Yeni tool'u sistemin tool registry veya export katmanina ekle.

Bu adimda hedef, yazilan tool'un gercekten discover edilebilir, cagrilabilir
ve ilgili agent/runtime tarafindan kullanilabilir hale gelmesidir. Sadece
dosya olusturmak yeterli degildir; registry kaydi tamamlanmadan tool eksik sayilir.

Exit criteria:
- Registry kaydi eklendi
- Tool import/export zinciri calisiyor
- Sistem icinden cagrilabilir durumda
"""
```

---

## 3. `akos-migration`

Supabase migration sureclerini standartlastirmak icin kullanilacak workflow formula.

```toml
description = """
AkOs icin Supabase migration workflow'u.

Bu formula, veritabani degisikliklerini yalnizca SQL yazmakla sinirlamaz;
RLS policy, uretilen tipler ve test asamalarini da zorunlu hale getirir.
Boylece migration'lar sadece "calisan SQL" degil, uygulama ile uyumlu ve
guvenli veri degisikligi paketleri olarak ele alinir.
"""
formula = "akos-migration"
type = "workflow"
version = 1

[[steps]]
id = "sql-yaz"
title = "Migration SQL'ini yaz"
description = """
Supabase icin gerekli tablo, kolon, constraint, trigger, function veya veri
donusum SQL'ini yaz.

Bu adimda hedef, migration'in acik, okunabilir ve tekrar uygulanabilir
olmasidir. Up/degisiklik mantigi net olmali; mevcut veri yapisini bozacak
riskler erkenden gorulmelidir.

Exit criteria:
- SQL migration dosyasi yazildi
- DDL/DML kapsami net
- Lokal ortamda uygulanabilir durumda
"""

[[steps]]
id = "rls-policy"
title = "RLS policy ekle veya guncelle"
needs = ["sql-yaz"]
description = """
Yeni tablo veya degisen veri modeli icin gerekli Row Level Security
policy'lerini ekle ya da revize et.

Bu adimda hedef, verinin sadece dogru actor'ler tarafindan okunup
yazilabilmesini saglamaktir. Supabase tarafinda tablo yaratip policy
eklememek eksik migration kabul edilir.

Exit criteria:
- Gerekli RLS policy'leri yazildi
- Read/write kurallari net
- Auth senaryolariyla uyum saglandi
"""

[[steps]]
id = "types-uret"
title = "Uygulama tiplerini uret"
needs = ["rls-policy"]
description = """
Supabase schema degisikliklerinden sonra uygulamanin kullandigi TypeScript
veya ilgili tip uretim adimini calistir ve guncel tipleri projeye al.

Bu adimda hedef, veritabani ile uygulama kodu arasinda sessiz uyumsuzluk
olusmasini engellemektir. Migration tamamlanmis sayilmaz; tipler de guncel
olmalidir.

Exit criteria:
- Tip uretimi calisti
- Guncel type dosyalari commit'e hazir
- Kod tarafinda schema uyumu saglandi
"""

[[steps]]
id = "test"
title = "Migration akisini test et"
needs = ["types-uret"]
description = """
Migration'in uygulandigini, policy'lerin beklendigi gibi davrandigini ve
uygulama kodunun yeni schema ile calistigini test et.

Bu adimda hedef, yalnizca SQL syntax'inin degil; migration'in butun etkisinin
dogrulanmasidir. Mumkunse lokal reset/apply akisi, policy davranisi ve ilgili
integration testleri birlikte kontrol edilmelidir.

Exit criteria:
- Migration basariyla uygulandi
- Policy davranisi dogrulandi
- Tip ve uygulama entegrasyonu test edildi
"""
```

---

## Kisa Notlar

- Bu formulalar `mol-polecat-work` mantigina paralel olarak sirali, resume-edilebilir workflow adimlari icin tasarlandi.
- Istersen bir sonraki adimda bunlari gercek `.formula.toml` dosyalari olarak da uretebilirim.
- Formula'lari `gt sling <formula> --on <bead> akos` gibi akislarda kullanilacak sekilde daha da sertlestirmek icin variable alanlari da eklenebilir.
