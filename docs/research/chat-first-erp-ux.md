# Chat-First ERP UX Arastirmasi

> AkOs icin AI-first insaat proje yonetim sistemi UX referans dokumani

## Icindekiler

1. [Chat-First ERP/Is Uygulamasi UX Paternleri](#1-chat-first-erpis-uygulamasi-ux-paternleri)
2. [Insaat/ERP Sektorunde AI Chat Ornekleri](#2-insaaterp-sektorunde-ai-chat-ornekleri)
3. [Chat Uzerinden Onay Mekanizmalari](#3-chat-uzerinden-onay-mekanizmalari)
4. [Mobil Chat UX](#4-mobil-chat-ux)
5. [Proaktif AI Bildirimleri](#5-proaktif-ai-bildirimleri)
6. [Chat-First vs Form-First Karsilastirmasi](#6-chat-first-vs-form-first-karsilastirmasi)
7. [AkOs Icin Mimari Oneriler](#7-akos-icin-mimari-oneriler)

---

## 1. Chat-First ERP/Is Uygulamasi UX Paternleri

### Chat + Yan Panel (Split-Pane) Mimarisi

Modern AI uygulamalarinin olusturduklari en etkili UX paterni, sohbet ile yapilandirilmis icerik arasindaki ayrimdir. Bu patern, kullanicinin dogal dilde konusmaya devam ederken, AI ciktisini ayri bir panelde gormesini saglar.

**Baslica ornekler:**

| Urun | Patern | Aciklama |
|------|--------|----------|
| ChatGPT Canvas | Sol sohbet + sag duzenleme paneli | Belge/kod uretimi sirasinda sohbet devam eder; cikti ayri panelde duzenlenebilir |
| Claude Artifacts | Sol sohbet + sag artifact paneli | Yapilandirilmis ciktilar (kod, tablo, diyagram) ayri panelde render edilir |
| v0.dev | Alt sohbet + ust onizleme | Dogal dilde UI tanimlama, canli onizleme panelinde render |
| Cursor | Yan panel sohbet + editor | Cmd+K ile satir ici duzenleme, Cmd+L ile uzun sohbet |

**Kaynaklar:**
- [OpenAI Canvas](https://openai.com/index/introducing-canvas/)
- [Anthropic Artifacts](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- [v0.dev](https://v0.dev/docs)
- [Cursor Docs](https://docs.cursor.com)

### Temel Tasarim Ilkeleri

**Intent Recognition -> Structured Action (Niyet Tanima -> Yapilandirilmis Eylem):**
Kullanici dogal dilde yazdiginda sistem bunu yapilandirilmis bir tool cagrisina donusturur. Ornegin:

```
Kullanici: "Konut A Blok projesi olustur, butce 5M TL"
Sistem:    createProject({ name: "Konut A Blok", budget: 5000000 })
```

Bu yaklasim, AI SDK'nin tool-calling mekanizmasiyla dogrudan uyumludur. Her tool, Zod schema ile dogrulanir ve tip-guvenli donusu saglar.

**Progressive Disclosure (Kademeli Acilim):**
Basit islemler sohbetle, karmasik islemler detay panelleriyle yapilir. Kullanici "proje durumu ne?" dediginde ozet kart gosterilir; detaya inmek istediginde tam dashboard acilir.

**Contextual Tool Results (Baglam Icinde Sonuc Gosterimi):**
Sonuclar sohbet icinde kart, tablo veya grafik olarak gosterilir. Kullanici baska bir sayfaya yonlendirilmez, boylece konusma akisi korunur.

**Slash Commands (Kisa Yol Komutlari):**
Deneyimli kullanicilar `/proje-olustur` veya `/dashboard` yazarak dogrudan islem yapabilir. Bu, chat-first ile command-line paradigmasini kopruler.

### Ilham Veren Uygulamalar

- **Linear:** Cmd+K ile universal komut arayuzu — dogal dil niyetini yapilandirilmis eyleme donusturur
- **Notion AI:** Belge icinde satir ici AI etklesimi; metin secip AI'dan donusturmesini isteme
- **Slack Workflow Builder:** Sohbet icinde is akisi tetikleme, onay sureclerini chat uzerinden yurutme

---

## 2. Insaat/ERP Sektorunde AI Chat Ornekleri

### Procore Copilot

Procore, insaat yonetimi platformuna entegre bir AI asistan sunmaktadir. Temel ozellikleri:

- **Dogal dil ile proje sorgulama:** "Downtown Tower projesindeki geciken RFI'lari goster"
- **Belge anlama:** Insaat cizimleri, sartnameler ve sozlesmeleri okuyarak sorulara cevap verir
- **Baglamsal AI paneli:** Bagimsiz bir sohbet degil, her modulden (RFI, submittal, gunluk log, degisiklik emirleri) cagrilabilen bir asistan kaplamasidir

**Onemli tasarim karari:** Procore, AI'yi tek bir sohbet penceresi degil, mevcut is akislarina gomulu bir katman olarak konumlandirir. Kullanici hangi moduldeyse, AI o modulun baglamini bilir.

**Kaynak:** [Procore AI](https://www.procore.com/platform/ai)

### Autodesk Construction Cloud

Autodesk, insaat bulut platformunda AI-destekli arama ve ozetleme sunar:

- Buyuk belge setlerinde dogal dil arama
- Plan ve sartnameler arasinda capraz bilgi getirme
- "3. kat koridorlarinin yangin dayanim gereksinimleri nelerdir?" gibi sorulara cevap

**Kaynak:** [Autodesk Construction Cloud](https://construction.autodesk.com/)

### SAP Joule

SAP'nin konusma tabanli AI asistani, ERP fonksiyonlarina dogal dil erisimi saglar:

- **Yan panel entegrasyonu:** SAP Fiori arayuzu icinde yan panel olarak calisir
- **Rol bazli baglamsal:** Kullanicinin rolu, yetkileri ve mevcut modulune gore yanit verir
- **Eyleme donusturulebilir kartlar:** "Bekleyen satin alma emirlerini goster" sorgusu, Onayla/Reddet butonlu kartlar dondurur
- **Coklu modul erisimi:** S/4HANA, SuccessFactors, Ariba gibi tum SAP modullerinden tek arayuz

**Kaynak:** [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)

### Insaat Sektorune Ozel Chat Paternleri

| Patern | Aciklama | Ornek |
|--------|----------|-------|
| Rol bazli yanit | Ayni soru, farkli roller icin farkli cevap | Saha muduru: guvenlik + ilerleme; Finans: maliyet sapma + odeme |
| Foto/belge entegrasyonu | Chat icinde fotograf yukleme ve referanslama | "Bu demir donatim sorununu raporla" + kamera erisimi |
| Konum bilgisi | Mobil cihazdan GPS koordinati otomatik ekleme | "Mevcut konumda sorun bildir" |
| Cevrimdisi kuyruk | Zayif baglanti icin mesaj kuyruge alma | Saha iscileri icin kritik |

---

## 3. Chat Uzerinden Onay Mekanizmalari

### Temel Paternler

Onay mekanizmalari, is uygulamalarinda chat-first mimarinin en kritik bilesenidir. Her durum degistiren islem (olusturma, guncelleme, silme) onay adimi gerektirir.

#### Patern 1: Satir Ici Onay Karti

```
Kullanici: "PO-2024-0847 numarali celik teslimat siparisini onayla"

AI: ┌─────────────────────────────────────────┐
    │ Satin Alma Emri PO-2024-0847            │
    │ Tedarikci: Kardemir Celik               │
    │ Tutar: 245.000 TL                       │
    │ Teslimat: 15 Nisan 2026                 │
    │                                         │
    │ [Onayla ✓]  [Reddet ✗]  [Detay Gor]    │
    └─────────────────────────────────────────┘
```

Kullaniciya tam baglam sunulur, karar icin baska bir yere gitmesi gerekmez.

#### Patern 2: Toplu Onay Ozeti

```
Kullanici: "Bu haftanin tum puantajlarini onayla"

AI: ┌──────────────────────────────────────────┐
    │ 5 puantaj onay bekliyor:                 │
    │ - Ahmet K. — 42s (2s fazla mesai)        │
    │ - Mehmet Y. — 40s                        │
    │ - ... 3 kayit daha                       │
    │ Toplam maliyet etkisi: 12.400 TL         │
    │                                          │
    │ [Tumunu Onayla] [Tek Tek Incele] [Iptal] │
    └──────────────────────────────────────────┘
```

#### Patern 3: AI Koruma Mekanizmali Kosullu Onay

```
Kullanici: "C Blok beton dokumunu onayla"

AI: ⚠️ Yarin (5 Nisan) hava tahmininde yagmur gosteriliyor.
    Yagmurda beton dokumu kaliteyi olumsuz etkileyebilir.
    
    Secenekler:
    [Yine de Onayla] [7 Nisan'a Ertele] [Saha Muhendisine Sor]
```

AI, kararla ilgili baglam bilgisini proaktif olarak sunar.

#### Patern 4: Zincirleme Onay Akisi

Chat, sirali onay zincirlerini yonetebilir:

```
AI: PO Proje Muduru tarafindan onaylandi.
    Tutar 100.000 TL uzerinde oldugu icin Finans Direktoru
    onayina yonlendiriliyor...
```

### Gercek Dunya Ornekleri

- **Microsoft Teams Approvals:** Teams sohbeti icinde onay is akislari; onaycilar eyleme donusturulebilir kartlar alir ([Microsoft Teams Approvals](https://support.microsoft.com/en-us/office/approvals-in-microsoft-teams))
- **Slack Workflow Builder:** Mesaj, emoji veya slash komutu ile tetiklenen no-code onay akislari ([Slack Workflows](https://slack.com/features/workflow-automation))
- **SAP Joule:** "Bekleyen onaylari goster" komutu, satir ici onayla/reddet butonlu eyleme donusturulebilir kartlar sunar

### En Iyi Uygulamalar

1. **Yikici eylemleri asla otomatik yurutme.** Olusturma, guncelleme, silme ve finansal islemler icin her zaman acik onay iste.
2. **Onay kartinda tam baglam sun.** Kullanici karar icin baska bir yere gitmek zorunda kalmamali.
3. **Geri alinabilir eylemler icin geri alma sagla.** "Proje olusturuldu. [Geri Al]"
4. **Sohbet gecmisi = denetim izi.** Konusmanin kendisi onay kaydi olur: "Ahmet tarafindan 4 Nisan 14:32'de onaylandi."
5. **Hassas onaylar icin zaman asimi.** Belirli esik uzerindeki finansal onaylar, belirli surede islenmezse suresi dolmali.

---

## 4. Mobil Chat UX

### Responsive Tasarim

Desktop'taki split-pane yapi mobilde tek ekran sohbet gorunumune donusur. Yan paneller bottom sheet (alt sayfa) veya ayri ekranlar haline gelir.

**Temel mobil sohbet UX kurallari:**

| Kural | Aciklama |
|-------|----------|
| Alt sabit giris | Mesaj girisi ekranin altinda, bas parmak erisiminde |
| Genisleyebilir giris alani | Cok satirli giriste yukari dogru buyuyen, gonderdikten sonra kuculen alan |
| Tam ekran sohbet | Mobilde split-pane yok, tek panel sohbet |
| Bottom sheet detay | Yapilandirilmis veri icin alttan kayan detay panelleri |

### Hareket (Gesture) Paternleri

- **Saga kaydir = yanit/alinti:** Telegram ve WhatsApp tarafindan yerlestirilen patern. Is baglaminda, belirli AI yanitlarina veya veri kartlarina referans vermek icin kullanilir.
- **Sola kaydir = eylem menüsü:** Mesaj uzerinde kaydir, baglam eylemleri (kopyala, paylas, takima ilet, yer imi) acilir.
- **Asagi cek = gecmis yukle:** Eski mesajlari yuklemek icin standart mobil patern.
- **Yatay kaydir = panel gecisi:** Is uygulamasinda, sohbet ve detay/veri gorunumu arasinda gecis (desktop yan panelinin yerine).

### Insaat Sahasina Ozel Mobil Paternler

**Ses girisi:** Insaat iscilerinin elleri kirli veya eldivenli olabilir. Sesle metin girisi kritik oneme sahiptir:

```
"Hey AI, bugun B Bolumu'nde 40 metrekup beton dokuldugunu kaydet"
```

**Dogrudan kamera erisimi:** Chat girisinden kamera acarak fotograf cekmek ve sorun raporlamak:

```
Kullanici: [Fotograf ceker]
AI: Foto alindi. Bu sorunu nasil siniflandirmaliyim?
    [Guvenlik] [Kalite] [Ilerleme] [Diger]
```

**Konum baglami:** Mobil cihazdan GPS koordinati otomatik olarak eklenir. Buyuk insaat sahalarinda "nerede?" sorusunu ortadan kaldirir.

**Cevrimdisi mesaj kuyrugu:** Baglantilar kesildiginde mesajlar kuyruge alinir, baglanti geldiginde gonderilir. Gonderildi/bekliyor/teslim edildi durumlari gorsel gostergelerle belirtilir.

### Bildirim Paternleri

- **Eyleme donusturulebilir push bildirimleri:** "PO-2024-0847 onayinizi bekliyor. [Onayla] [Gor]" — iOS ve Android 4 butona kadar interaktif bildirim destekler.
- **Kategori bazli sayac:** Onaylar, mesajlar ve uyarilar icin ayri bildirim sayaclari.
- **Akilli gruplama:** Proje bazinda grupla ("Downtown Tower: 3 bekleyen madde") — her madde icin ayri bildirim yerine.
- **Sessiz saatler + acil gecis:** Rahatsiz etmeyin moduna saygi goster, ama kritik bildirimler (guvenlik olaylari, butce asimi) gecebilsin.

**Kaynaklar:**
- [Material Design 3 — Chat Paternleri](https://m3.material.io/)
- [Apple HIG — Mesajlasma](https://developer.apple.com/design/human-interface-guidelines/messaging)
- [Nielsen Norman Group — Mobil UX](https://www.nngroup.com/topic/mobile-ux/)

---

## 5. Proaktif AI Bildirimleri

Proaktif AI, reaktif modelden (kullanici sorar, AI cevaplar) proaktif modele (AI veriye dayanarak baslatir) gecisi temsil eder. Bu, is uygulamalarinda bir sonraki nesil AI'nin tanimlayici ozelligidir.

### Temel Proaktif Bildirim Paternleri

#### Anomali Tespiti Uyarilari

```
AI: ⚠️ Butce Uyarisi — Downtown Tower Projesi
    Beton maliyetleri butcenin %18 uzerinde seyirediyor (45.000 TL asim).
    Mevcut harcama hizinda, beton kalemini 20 Nisan'a kadar asacaksiniz.
    
    [Maliyet Dokumunu Gor] [Tahmini Guncelle] [Kapat]
```

AI, verileri surekli izler ve beklenen paternlerden sapmalari yuzeye cikarir.

#### Tarih/SLA Uyarilari

```
AI: 📋 Yaklasan Son Tarih
    48 saat icinde incelenmesi gereken 3 submittal:
    - Celik yapisal atolye cizimleri (son tarih: 6 Nisan)
    - Elektrik pano semalari (son tarih: 6 Nisan)
    - Su yalitim sartnamesi (son tarih: 7 Nisan)
    
    [Tumunu Incele] [Takima Devret] [24s Ertele]
```

#### Baglamsal Oneriler

```
AI: 💡 Oneri
    Hava tahminine gore (8-10 Nisan yogun yagmur), 9 Nisan'a
    planlanan dis cephe boyama isini ertelemek isteyebilirsiniz.
    
    [Ertele] [Plan Gibi Kalsin] [Hava Detaylarini Gor]
```

#### Sabah Brifing / Gunluk Ozet

```
AI: Gunaydin, Ahmet. 4 Nisan brifing'iniz:
    
    🔴 Kritik: Bugun guvenlik denetimi var (A Blok)
    🟡 Dikkat: 2 degisiklik emri onayinizi bekliyor (toplam 78.000 TL)
    🟢 Yolunda: 4 aktif proje butce ve takvimde
    
    [Gun Incelemesini Baslat] [Onaylara Git]
```

### Gercek Dunya Ornekleri

- **Microsoft Copilot (M365):** Toplanti hazirlik ozetleri, e-posta ozetleri ve eylem maddelerini proaktif olarak sunar
- **Salesforce Einstein:** Satis boru hatti icin tahmine dayali uyarilar — "X anlasma kayma riskinde. Bu hafta aktivite %40 azaldi" ([Salesforce Einstein](https://www.salesforce.com/einstein/))
- **Google Workspace AI:** Gmail'de akilli oneriler (cevaplanmayan e-postalari takip etme nudge'lari), akilli yazma ve toplanti ozetleri
- **Intercom Fin:** Davranis paternlerine gore web sitesi ziyaretcilerine proaktif ulasan AI ajan ([Intercom Fin](https://www.intercom.com/fin))

### En Iyi Uygulamalar

1. **Dikkat butcesine saygi goster.** Her icgoruyu bildirime donusturme. Ciddiyet seviyeleri (Kritik, Uyari, Bilgi) kullan ve kullanicilarin esikleri yapilandirmasina izin ver.
2. **Zamanlama onemli.** Gunluk brifinglari is gununu basinda ilet. Yogun calisma donemlerinde acil olmayan proaktif mesajlar gonderme.
3. **Kapat/ertele secenegi sun.** Kullanicilar bildirimleri onaylayip temizleyebilmeli. Surekli rahatsiz etme guveni yikar.
4. **Gerekceyi acikla.** "Bu ayi beton maliyetleri %18 artigi icin sizi uyariyorum" — seffaflik, AI onerilerine guveni arttirir.
5. **Kapatmalardan ogren.** Kullanici bir bildirim turunu surekli kapatiyorsa, sikligini azalt. Uyarlanabilir bildirim onceligi.
6. **Eylem odakli ol.** Her proaktif mesajda en az bir eyleme donusturulebilir buton bulunmali. Eylemsiz bilgi endise yaratir.

---

## 6. Chat-First vs Form-First Karsilastirmasi

### Chat-First Ne Zaman Kullanilmali?

| Senaryo | Chat Neden Daha Iyi |
|---------|---------------------|
| Kesfedici sorgular | "Proje A'nin durumu ne?" — hicbir form her soruyu ongoremez |
| Cok adimli is akislari | Dogal konusma, dallanan mantigi form sihirbazlarindan daha iyi yonetir |
| Seyrek yapilan isler | Ayda bir kullanilan bir arayuzu ogrenmeye gerek yok |
| Karmasik veri getirme | "Q1'de butce asan tum projeleri goster" — filtre yaplandirmaktan kolay |
| Onay is akislari | Baglam kartlariyla hizli evet/hayir kararlari |
| Mobil/saha kullanimi | Kucuk ekranda formlarda gezinmekten mesaj yazmak daha kolay |
| Ise alistirma/egitim | Yeni kullanicilar "Satin alma emri nasil olusturulur?" diye sorabilir |

### Form-First Ne Zaman Kullanilmali?

| Senaryo | Form Neden Daha Iyi |
|---------|---------------------|
| Cok alanli yapilandirilmis veri girisi | 20 alanli bir form, sohbette 20 niteligi dikte etmekten hizlidir |
| Veri tablolari/gridler | Tablo verisini tarama, siralama ve karsilastirma gorsel yogunluk gerektirir |
| Hassas sayisal giris | Butce rakamlari, miktarlar, tarihler kesin giris ve dogrulama gerektirir |
| Tekrarli yuksek hacimli isler | Gunde 100+ giris yapan veri operatorleri optimize formlar gerektirir |
| Gorsel/mekansal isler | Gantt grafikleri, kat planlari, surekle-birak zamanlama |
| Mevzuat uyumlulugu | Belirli form duzeninin yasal olarak gerekli oldugu durumlar |

### Hibrit Yaklasim (En Iyi Uygulama)

Optimal patern **sohbetle baslayan, formla tamamlanan** yaklasimdir:

```
1. Kullanici sohbette baslar: "Yeni taseron sozlesmesi olustur"
2. AI bilinen parametreleri cikarir: "Hangi taseron ve proje icin?"
3. Kullanici baglam saglar: "Kardemir Celik, Downtown Tower, celik yapi paketi"
4. AI on dolu form/kart sunar: Bilinen alanlar dolu, kalan alanlar vurgulu
5. Kullanici inceler ve gonderir: Form hassasiyet saglar; sohbet hiz sagladi
```

**Bu hibrit paterni kullanan ornekler:**
- **Notion AI:** Tablo olusturmayi AI'dan iste, yapiyi uretir, sonra geleneksel Notion arayuzunde duzenle
- **Linear:** Cmd+K ile dogal dilden issue olustur, sonra yapilandirilmis form ciksin ince ayar icin
- **Shopify Magic:** AI sohbetten urun aciklamasi uret, standart urun editoru'nde son duzenlemeyi yap

### Karsilastirma Tablosu

| Kriter | Chat-First | Form-First |
|--------|-----------|------------|
| Ogrenme egrisi | Dusuk (herkes sohbet etmeyi bilir) | Yuksek (karmasik ERP sistemleri) |
| Belirsizlik yonetimi | Iyi (AI netlesstirici sorular sorabilir) | Zayif (sabit alanlar) |
| Erisilebilirlik | Diller arasi dogal dil erisimi | Ekran okuyuculariyla daha iyi uyum |
| Yaplandirima veri girisi | Yavas (cok alanli veriler icin) | Hizli (bilinen, tekrarli is akislari) |
| Denetim izi | Dogal (konusma gecmisi = kayit) | Manuel (form gonderim kayitlari) |
| Kesif | Zor (kullanicilar ne sorabilecegini bilmiyor) | Kolay (menuler ve formlar gorsel) |
| AI gecikme/maliyet | Var (her istek API cagrisi) | Yok (determistik arayuz) |
| Mobil uyumluluk | Yuksek (mesajlasma dogal) | Dusuk (karmasik formlar mobilde zor) |
| Tahmin edilebilirlik | Dusuk (AI yanlis yorumlayabilir) | Yuksek (deterministik) |
| Esneklik | Yuksek (beklenmedik is akislari) | Dusuk (katı form yapisi) |

---

## 7. AkOs Icin Mimari Oneriler

### Desktop Mimari

**Split-pane duzeni** onerilir:

```
┌──────────────────────────────────────────────────┐
│  AkOs                                    [=] [-] │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  SOHBET    │         ANA ICERIK ALANI            │
│  PANELI    │                                     │
│            │  Dashboard / Gantt / Tablo /         │
│  Surekli   │  Detay Gorunumu                     │
│  gorunur   │                                     │
│            │  (AI tool sonuclari burada           │
│  Mesaj     │   render edilir)                     │
│  gecmisi   │                                     │
│            │                                     │
│  ────────  │                                     │
│  [Mesaj    │                                     │
│   girisi]  │                                     │
└────────────┴─────────────────────────────────────┘
```

- Sohbet paneli her zaman gorunur (sol veya sag)
- Yapilandirilmis gorunumler (dashboard, Gantt, maliyet tablolari) ana alanda render edilir
- AI tool sonuclari hem sohbette kart olarak hem de ana alanda detayli gorunum olarak gosterilir

### Mobil Mimari

```
┌──────────────────┐
│  AkOs     [☰]    │
│                   │
│  Tam ekran sohbet │
│                   │
│  Mesaj gecmisi    │
│  + AI kartlari    │
│  + Inline onay    │
│                   │
│  ────────────     │
│  [📷] [Mesaj..] [↑]│
└──────────────────┘
      ↕ Yukari kaydir
┌──────────────────┐
│  [Bottom Sheet]   │
│  Yapilandirilmis  │
│  detay gorunumu   │
│  (tablo, form,    │
│   grafik)         │
└──────────────────┘
```

- Tam ekran sohbet, bottom sheet detay gorunumleri
- Ses girisi destegi (saha iscileri icin)
- Cevrimdisi mesaj kuyrugu

### Onay Akisi Mimarisi

1. **Satir ici onay kartlari:** Her mutasyon isleminde [Onayla]/[Reddet] butonlu kartlar
2. **Toplu onay ozetleri:** Verimlilik icin gruplu onay
3. **Mobilde push bildirimleri:** Eyleme donusturulebilir butonlarla
4. **AI koruma mekanizmasi:** Kararla ilgili baglam bilgisinin proaktif sunumu

### Proaktif AI Stratejisi

| Bildirim Turu | Tetikleyici | Oncelik |
|---------------|------------|---------|
| Sabah brifing | Her gun saat 08:00 | Normal |
| Butce anomalisi | Kalem %15+ asim | Yuksek |
| Tarih uyarisi | Son tarih <48 saat | Yuksek |
| Hava bazli oneri | Kotu hava + dis is | Normal |
| Guvenlik olayı | Derhal | Kritik |

### Hibrit Giris Stratejisi

**Kural:** Sohbetle basla, gerektiginde form sun.

- **Hizli islemler (1-3 parametre):** Tamamen sohbetle
- **Orta karmasiklik (4-8 parametre):** Sohbet + on dolu kart
- **Yuksek karmasiklik (8+ parametre):** Sohbetle baslat, tam form ac

### Insaat Sektorune Ozel Oneriler

1. **Rol bazli AI yanitlari:** Saha muduru vs finans muduru vs proje sahibi icin farkli yanit formatlari
2. **Foto/belge entegrasyonu:** Chat icinde dogrudan kamera erisimi ve belge referanslama
3. **GPS tabanli raporlama:** Buyuk sahalarda otomatik konum etiketi
4. **Cevrimdisi-oncelikli tasarim:** Guvenilmez saha baglantisi icin mesaj kuyrugu ve yerel onbellek
5. **Coklu taraf koordinasyonu:** Taseronlar, mal sahipleri ve mimarlar arasinda organizasyonel sinirlara duyarli AI

---

## Kaynaklar

### UX ve Tasarim
- [Nielsen Norman Group — Chatbot UX](https://www.nngroup.com/articles/chatbots/)
- [Nielsen Norman Group — AI Assistants](https://www.nngroup.com/articles/ai-assistants/)
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SAP Fiori Design Guidelines](https://experience.sap.com/fiori-design/)
- [Microsoft Fluent UI Copilot Patterns](https://fluent2.microsoft.design/)

### Urun ve Platform
- [OpenAI ChatGPT Canvas](https://openai.com/index/introducing-canvas/)
- [Anthropic Claude Artifacts](https://support.anthropic.com/en/articles/9487310)
- [Vercel v0.dev](https://v0.dev/docs)
- [Cursor Docs](https://docs.cursor.com)
- [Procore AI](https://www.procore.com/platform/ai)
- [Autodesk Construction Cloud](https://construction.autodesk.com/)
- [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)

### Is Akisi ve Onay
- [Microsoft Teams Approvals](https://support.microsoft.com/en-us/office/approvals-in-microsoft-teams)
- [Slack Workflow Builder](https://slack.com/features/workflow-automation)
- [Salesforce Einstein](https://www.salesforce.com/einstein/)
- [Intercom Fin](https://www.intercom.com/fin)

### Sektor Raporlari
- Gartner, "The Future of ERP is Conversational" (2024)
- Forrester, "Conversational AI in Enterprise Applications" (2024)
