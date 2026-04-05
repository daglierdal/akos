# GT İç Sistem Analizi

Tarih: 2026-04-05
Çalışma dizini: `/Users/akrotesbot/gt/akos/polecats/guzzle/akos`

## Kapsam

Bu not şu üç kaynağa dayanır:

1. `~/.beads/`
2. `~/.config/gt/`
3. `gt help` ve ilgili yardım çıktıları (`gt formula --help`, `gt formula create --help`, `gt plugin --help`, `gt role --help`, `gt directive --help`)

Amaç: GT içinde varsayılan `formula` ve `skill` şablonları olup olmadığını anlamak.

## Bulgular

### 1. Kullanıcı dizininde GT yapılandırma içeriği yok

Doğrudan dosya sistemi kontrolünde şu iki yol bulunamadı:

- `~/.beads`
- `~/.config/gt`

`stat ~/.beads ~/.config/gt` çıktısı her iki yol için de `No such file or directory` döndürdü.

Ek aramada da bu yollar altında `formula`, `skill`, `template`, `*.md`, `*.json`, `*.yaml`, `*.yml` uzantılı hiçbir dosya bulunmadı.

Sonuç:

- Kullanıcı seviyesinde hazır GT formül deposu yok.
- Kullanıcı seviyesinde ayrı bir GT skill deposu da görünmüyor.

### 2. `gt` yardım çıktıları formül sistemini açıkça gösteriyor

`gt --help` içinde şu komut açıkça var:

- `formula        Manage workflow formulas`

`gt formula --help` çıktısına göre formüller:

- TOML/JSON dosyalarıdır.
- Yeniden kullanılabilir workflow tanımlarıdır.
- Arama yolları sırasıyla şunlardır:
  - `.beads/formulas/` (project)
  - `~/.beads/formulas/` (user)
  - `$GT_ROOT/.beads/formulas/` (orchestrator)

Bu aynı zamanda formül sisteminin üç katmanlı olduğunu gösterir:

- proje-local
- kullanıcı-global
- orchestrator/global default

### 3. Formül şablonu üretimi var

`gt formula create --help` çıktısı şunu doğruluyor:

- `Create a new formula template file.`
- Yeni başlangıç dosyası `.beads/formulas/` altında oluşturuluyor.
- Desteklenen başlangıç tipleri:
  - `task`
  - `workflow`
  - `patrol`

Bu nedenle GT içinde **formül şablonu üretme mekanizması kesin olarak var**.

Ancak dikkat edilmesi gereken ayrım:

- Bu komut bir **starter template** üretir.
- Kullanıcı home dizininde önceden kurulmuş bir formül şablon koleksiyonu bulunmadı.

### 4. Görünen hazır formüller kullanıcı home dizininden değil, orchestrator katmanından geliyor

`gt formula list` çıktısı toplam `47 found` döndürdü.

Örnekler:

- `shiny`
- `shiny-enterprise`
- `shiny-secure`
- `code-review`
- `design`
- çok sayıda `mol-*` workflow’u

Kaynağı doğrulamak için `gt formula show shiny` çalıştırıldı. Çıktı:

- `Source: /Users/akrotesbot/gt/.beads/formulas/shiny.formula.toml`

Bu çok önemli bir sonuç:

- Formüller `~/.beads/formulas/` altından gelmiyor.
- Formüller bu ortamda `$GT_ROOT/.beads/formulas/` altından geliyor.
- Yani bunlar kullanıcıya özel değil, town/orchestrator seviyesinde paylaşılan varsayılanlar.

Ek gözlem:

- `/Users/akrotesbot/gt/.beads/formulas/` altında `48` dosya var.
- Bunlardan biri `.installed.json`, geri kalanı formül dosyaları.
- `gt formula list` içinde görünen `47` sayı, bu metadata dosyası hariç gerçek formül sayısıyla uyumlu.

### 5. `skill` için ayrı ve görünür bir sistem yüzeyi bulunamadı

`gt --help` çıktısında doğrudan bir `skill` komutu yok.

Arama sonucunda ilgili görünen komutlar şunlar:

- `role`
- `directive`
- `plugin`
- `prime`

Bunların anlamı:

- `role`: ajan rolünü yönetiyor/gösteriyor
- `directive`: rol bazlı markdown yönlendirmeleri yönetiyor
- `plugin`: Deacon patrol cycle sırasında çalışan otomasyonları yönetiyor

`gt directive --help` çıktısına göre directive dosyaları:

- town-level: `<townRoot>/directives/<role>.md`
- rig-level: `<townRoot>/<rig>/directives/<role>.md`

Bu yapı bir tür davranış katmanı sağlıyor, ama CLI’da bunun adı `skill` değil.

Dolayısıyla bu tarama kapsamında:

- **Varsayılan formula seti var**
- **Varsayılan skill template sistemi görünmüyor**
- Skill’e en yakın yapı taşları `directive`, `role` ve kısmen `plugin`

## Sonuç

Kısa cevap:

- Evet, GT’de varsayılan **formula** sistemi ve başlangıç şablonu üretimi var.
- Evet, bu ortamda paylaşılan hazır formula seti de mevcut; kaynak `$GT_ROOT/.beads/formulas/`.
- Hayır, taranan yüzeylerde ayrı bir **skill template** sistemi görünmüyor.
- Kullanıcı seviyesinde `~/.beads/` ve `~/.config/gt/` altında önceden kurulmuş varsayılan formula/skill içeriği yok.

## En Net Çıkarım

GT’nin iç yapısı bu ortamda büyük ölçüde şöyle çalışıyor:

1. Formüller birinci sınıf kavram.
2. Varsayılan formüller kullanıcı home dizininde değil, town/orchestrator katmanında tutuluyor.
3. Kullanıcı isterse `gt formula create` ile proje içine yeni formül şablonu üretebiliyor.
4. `Skill` yerine daha çok `role + directive + plugin` ekseni kullanılıyor gibi görünüyor.

## Kanıt Olarak Kullanılan Komutlar

```bash
stat ~/.beads ~/.config/gt
find ~/.beads ~/.config/gt -maxdepth 3 \( -iname '*formula*' -o -iname '*skill*' -o -iname '*template*' -o -iname '*.md' -o -iname '*.yaml' -o -iname '*.yml' -o -iname '*.json' \) 2>/dev/null | sort

gt --help
gt formula --help
gt formula create --help
gt formula list
gt formula show shiny
gt plugin --help
gt role --help
gt directive --help
```
