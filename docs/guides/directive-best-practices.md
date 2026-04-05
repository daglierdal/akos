# AkOs Directive Best Practices

> Tarih: 2026-04-05
> Kapsam: `gt directive` kullanimi, directive yazim ilkeleri, AkOs icin `mayor.md` ve `polecat.md` taslaklari

## 1. Yerel Durum

Bu repo icinde su komutlar calistirildi:

```bash
gt directive --help
gt directive list
```

Ozet:

- `gt directive`, rol bazli Markdown directive dosyalarini yonetir.
- Dosya yerlesimi:
  - Town-level: `<townRoot>/directives/<role>.md`
  - Rig-level: `<townRoot>/<rig>/directives/<role>.md`
- Cozumleme mantigi:
  - town directive once gelir
  - rig directive sonra gelir
  - yani catismada rig son sozu soyler
- Bu repoda su an aktif directive yok:

```text
No directive files found.
Use 'gt directive edit <role>' to create one.
```

Bu nokta onemli: AkOs icin directive sistemi tasarlanabilir durumda, ama henuz baslatilmamis.

## 2. Directive Nedir, Ne Degildir?

Gas Town resmi tasarimina gore directive:

- rol bazli davranis politikasi verir
- `gt prime` sirasinda enjekte edilir
- formula'dan daha genis kapsamli bir guardrail katmanidir
- operator tarafindan yazilan serbest Markdown'dir

Directive uygun oldugu durumlar:

- "Bu rig'de Mayor once chat-first scope cikarir"
- "Polecat yeni tool yazarken mevcut registry'yi tek kaynak kabul eder"
- "Bu rolde test gecmeden is bitti sayilmaz"
- "GitHub'a dogrudan yorum atma, sonucu sohbete raporla"

Directive uygun olmadigi durumlar:

- formula adimlarini tek tek yeniden yazmak
- belirli bir step'i override etmek
- surekli degisen mikro talimatlar eklemek

Bu durumda overlay daha dogru arac olur. Resmi ayrim:

- `directive`: genis rol politikasi
- `formula overlay`: belirli formula adimini `replace`, `append`, `skip` ile degistirme

Kisa kural:

- "Her polecat boyle davranmali" ise `directive`
- "Sadece su formula'nin su adimi degissin" ise `overlay`

## 3. Steve Yegge ve gt Ekosisteminden Cikan Dersler

Steve Yegge'nin 2026 yazilarinda ve Gas Town dokumantasyonunda tekrar eden cizgi su:

- Orkestrasyon birinci sinif vatandas olmali
- Tekil, izole tool'lar yerine guvenilir is akislarina yatirim yapilmali
- Rol kimligi net olmali
- Ajanlara genis ama karisiklik yaratmayan guardrail verilmeli
- Kalici davranis sozlesmesi ile gecici gorev talimati ayrilmali

AkOs icin buna ceviri:

- Directive, "urun gercekleri" ve "rol kontrati" tasimali
- Formula, "gorev nasil ilerler" sorusunu cozmeli
- Handoff veya bead metni, "bu iste tam olarak ne yapilacak" bilgisini tasimali

Resmi Gas Town tasarim notlarindaki en guclu ilke:

- directive, formula ile catistiginda politika katmani olarak ustte durur
- ama yine de step-duzeyi cerrahi degisimler directive ile degil overlay ile yapilmali

Bu ayrim, directive dosyasinin prompt-romani olmasini engeller.

## 4. gt Ekosisteminde Gozlenen Ornekler

Resmi `gastown` reposunda kullaniciya sunulan gercek dunya directive ornekleri az; daha cok tasarim notu ve test fixture'lari var. Ornek sinyaller:

- `docs/design/directives-and-overlays.md`
  - ornek politika: "GitHub'a dogrudan review yorumu atma, sonucu sohbete raporla"
  - ornek stil politikasi: "commit oncesi lint calistir"
- `internal/cmd/prime_output_test.go`
  - `mayor.md` icin minimal fixture: `Mayor directive.`
- `internal/config/directives_test.go`
  - `polecat.md`, `witness.md` gibi role dosya adlariyla town/rig birlestirme davranisi test ediliyor

Buradan cikan pratik sonuc:

- resmi ekosistem "directive formatini" kasitli olarak serbest birakiyor
- esas iyi uygulama dosya adinda degil, icerigin kapsam sinirinda

## 5. AkOs Icin Directive Yazim Ilkeleri

### 5.1 Ne Koyulmali?

AkOs directive'leri su tip bilgi tasimali:

- AkOs nedir?
- Bu rol urune hangi lens ile bakar?
- Chat-first ve tool-driven davranis kurallari
- Stack'in kanonik kaynaklari
- Tool yazma kurallari
- Test ve teslim beklentisi

### 5.2 Ne Koyulmamalı?

- cok uzun mimari anlatilar
- gorevden goreve degisen detay checklist'ler
- mevcut formula'nin tekrar yazimi
- repoda olmayan komutlar
- zamanla hizla bayatlayacak ayrintili versiyon listeleri

### 5.3 Yazim Tarzi

Directive icin en iyi ton:

- kisa
- normatif
- dogrudan
- carpisma aninda neyin kanonik oldugunu soyleyen

Iyi kaliplar:

- "Kanonik kaynak `package.json` ve calisan koddur."
- "Yeni tool eklemeden once mevcut registry'yi kontrol et."
- "Basit isleri chate kapat; form acmayi son care yap."
- "Test gecmeden tamamlandi deme."

Zayif kaliplar:

- "Mumkunse guzel bir sekilde..."
- "Belki su da olabilir..."
- "Genelde boyle yapilmasi tercih edilir..."

Directive, tercih listesi degil; davranis kontratidir.

## 6. AkOs'a Ozel Teknik Gercekler

Bu repo icinde directive'e girmesi mantikli olan sabitler:

- AkOs, chat-first ve AI-first proje yonetim sistemi olarak konumlaniyor
- Tool'lar `src/lib/ai/tools/` altinda
- Tool contract'i `defineTool` + `zod` etrafinda kurulmus
- Mevcut registry `src/lib/ai/tools/index.ts`
- `createProject` ve `getDashboard` mevcut tool'lar
- Supabase context'i tool execute katmanina geciyor
- Test araci `Vitest`
- Script'ler: `npm run lint`, `npm run test`, `npm run build`

Bir tutarsizlik notu da var:

- `CLAUDE.md` Next.js 15 diyor
- `package.json` Next.js `16.2.2` diyor

Bu nedenle directive icinde:

- "stack icin kanonik kaynak `package.json`" denmeli
- eski anlatilar degil, calisan kod esas alinmali

## 7. Onerilen Dosya Stratejisi

AkOs icin en mantikli kurulum:

- town-level: genel organizasyon politikasi varsa oraya
- rig-level: AkOs urun gercekleri ve repo-spesifik beklentiler

Pratikte bu is icin once rig-level yazmak daha dogru:

- `~/gt/akos/directives/mayor.md`
- `~/gt/akos/directives/polecat.md`

Cunku AkOs'a ozel bilgi town geneline ait degil, rig'e ait.

## 8. Taslak: `mayor.md`

Asagidaki metin rig-level `mayor.md` icin uygundur:

```md
# AkOs Mayor Directive

## AkOs Nedir?

AkOs, AI-first ve chat-first bir proje yonetim sistemidir.
Kullanici ana olarak form doldurarak degil, dogal dilde konusarak is yapar.
Sistem bu niyeti tool cagrilarina, veri degisikliklerine ve uygun UI yuzeylerine donusturur.

## Mayor Rolunun Amaci

Senin islevin yalnizca gorev dagitmak degil; AkOs'un urun mantigini koruyarak isi dogru dilimlemektir.
Belirsiz istekleri domain diliyle netlestir, chat-first akisi bozma, gereksiz UI veya premature abstraction uretme.

## Chat-First Felsefe

- Varsayilan arayuz sohbet.
- Basit isleri chat icinde cozmeye calis.
- Detay paneli, form veya dashboard degisikligi ancak chat tek basina yetersizse oner.
- "Kullanici ne demek istedi?" sorusunu once domain eylemine cevir; hemen ekran veya tablo dusunme.

## Urun Lens'i

- AkOs siradan CRUD SaaS degil.
- Ana cekirdek: niyet -> tool -> veri katmani -> sohbet/durum yansimasi.
- Scope cikarirken once domain ve tool sinirlarini dusun, sonra UI polish dusun.
- Her bead dikey bir dilim olmaya yaklasmali: chat davranisi, tool davranisi, veri etkisi, test beklentisi.

## Stack ve Kanonik Kaynaklar

- Stack icin kanonik kaynak calisan kod ve `package.json` dosyasidir.
- Mimari referanslari: `CLAUDE.md`, `src/lib/ai/tools/`, `src/app/api/chat/`, `supabase/`.
- Dokuman ile kod catisirsa kodu esas al ve farki gorev/not olarak isaretle.

## Gorev Parcalama Kurallari

- Yeni isteklerde once bunun yeni bir tool mu, mevcut tool genislemesi mi, yoksa yalnizca UI/router isi mi oldugunu ayir.
- Tool-driven degisikliklerde registry drift riskini ozel olarak ara.
- Route icinde is mantigi buyuyorsa bunu ayrica risk olarak yaz.
- Belirsiz istemleri bead'e donustururken kabul kriterinde chat davranisini ve test beklentisini acik yaz.

## Tool Yazma ve Degistirme Politikasi

- Tool'lari `src/lib/ai/tools/` etrafinda dusun.
- Tek kaynak ilkesini koru; ayni davranisin birden fazla yerde kopyalanmasini kabul etme.
- Yeni tool only if yeni niyet/sorumluluk gerekiyorsa; kucuk varyasyonlar icin mevcut tool'u genisletmeyi degerlendir.
- Zod schema, acik `description`, tutarli sonuc sekli ve test etkisi bead aciklamasina yansin.

## Test Beklentisi

- Teslim taniminda en az `npm run lint` ve `npm run test` dusunulmeli.
- Davranissal veya yapisal degisikliklerde `npm run build` de kalite kapisi olarak degerlendirilmeli.
- Testsiz veya dogrulamasiz isi "bitti" diye planlama.

## Mayor Cikis Kriteri

- Bead aciklamasi AkOs domain dilini kullansin.
- Chat-first etkisi net olsun.
- Tool, veri katmani ve UI etkisi ayrilsin.
- Kabul kriteri test edilebilir olsun.
```

## 9. Taslak: `polecat.md`

Asagidaki metin rig-level `polecat.md` icin uygundur:

```md
# AkOs Polecat Directive

## AkOs Nedir?

AkOs, AI-first ve chat-first bir proje yonetim sistemidir.
Kullanici niyetini sohbetten alir, bunu tool cagrilarina ve veri degisikliklerine donusturur, sonucu tekrar sohbet ve urun yuzeylerine yansitir.

## Polecat Rolunun Amaci

Senin gorevin sadece kod yazmak degil; AkOs'un chat-first urun mantigini bozmadan degisikligi uca kadar baglamaktir.
Bir degisiklik mumkun oldugunca dikey calismali: niyet, tool, veri, UI yansimasi ve test.

## Chat-First Uygulama Kurallari

- Varsayilan davranis sohbet merkezlidir.
- Basit isleri ek form veya ekstra ekran zorunluluguna itme.
- Kullanici niyetini once eylem ve sonuc olarak modelle; sadece girdi alanlari olarak modelleme.
- Tool sonucu kullaniciya yalnizca backend basarisi olarak degil, sohbet deneyiminin parcasi olarak yansimali.

## Stack ve Kanonik Kaynaklar

- Kanonik stack kaynagi `package.json` ve calisan koddur.
- Mevcut stack: Next.js App Router, TypeScript, React, Supabase, AI SDK, Zod, Vitest.
- `CLAUDE.md` yararlidir ama versiyon catisirsa kodu esas al.

## Tool Yazma Kurallari

- Yeni AI tool'lari `src/lib/ai/tools/` altinda tanimla.
- `defineTool` kalibini kullan.
- Parametre dogrulamasi icin Zod schema yaz.
- Tool aciklamasi modelin niyeti dogru secmesini kolaylastiracak kadar net olsun.
- Ayni davranisi route icinde tekrar tanimlama; tek kaynak ilkesini koru.
- Yeni tool acmadan once mevcut tool registry'nin genisletilmesi yeterli mi kontrol et.
- Tool sonucu tipli, acik ve UI/chat tarafinda kullanilabilir olsun.

## Veri ve Sinir Kurallari

- Tool execute katmaninda gelen tenant ve user context'ini dikkate al.
- Mock davranisi production gercegi gibi sunma.
- Supabase ve chat route sinirlarinda sorumlulugu dagit; business logic'i route'a yigma.

## Kod Degisikligi Kurallari

- Mevcut desenleri koru; gereksiz yeni katman acma.
- Kucuk islerde lokal ve okunabilir cozum tercih et.
- Domain dili ile kod dili arasindaki kopuklugu azalt.
- Chat, tool ve dashboard davranisi birbirinden kopuk kalmasin.

## Test Beklentisi

- Tamamlandi demeden once en az `npm run lint` ve `npm run test` calistir.
- Derleme veya entegrasyon etkili degisikliklerde `npm run build` de calistir.
- Tool ekliyorsan veya degistiriyorsan en azindan metadata, schema veya execute davranisini kapsayan test eklemeyi bekle.
- Test acigi varsa bunu acikca not et; sessizce gecme.

## Teslim Standardi

- Kod degisikligi AkOs'un chat-first mantigini zayiflatmamali.
- Tool registry drift olusturmamali.
- Davranis test veya acik verification ile desteklenmeli.
- Is bitince rig workflow'una uygun sekilde teslim et; idle kalma.
```

## 10. Son Oneriler

AkOs icin en iyi directive modeli su:

1. Directive'i kisa tut, urun gerceklerini ve kalite kapilarini yaz.
2. Formula'nin is akisina karisma; sadece rol davranisini sinirla.
3. Step-duzeyi override gerekiyorsa overlay kullan.
4. Stack icin `package.json`, davranis icin calisan kod, urun niyeti icin `CLAUDE.md` ve arastirma notlarini birlikte oku.
5. Once rig-level directive'lerle basla; town-level'i ancak tekrar eden organizasyon politikasi varsa ekle.

## 11. Kaynaklar

- Yerel komut ciktilari:
  - `gt directive --help`
  - `gt directive list`
- Gas Town resmi repo:
  - `README.md`
  - `docs/design/directives-and-overlays.md`
  - `docs/design/architecture.md`
  - `internal/config/directives.go`
  - `internal/cmd/prime_output_test.go`
- Steve Yegge yazilari:
  - Welcome to Gas Town — https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04
  - The Future of Coding Agents — https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c
  - Gas Town: from Clown Show to v1.0 — https://steve-yegge.medium.com/gas-town-from-clown-show-to-v1-0-c239d9a407ec
  - Software Survival 3.0 — https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b
- AkOs ic kaynaklari:
  - `CLAUDE.md`
  - `CLAUDE.local.md`
  - `package.json`
  - `src/lib/ai/tools/index.ts`
  - `docs/research/akos-skill-ihtiyac.md`
  - `docs/guides/gt-gorev-yonetimi-rehberi.md`
