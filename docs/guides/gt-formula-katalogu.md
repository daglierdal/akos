# GT Formula Kataloğu

Bu doküman, `gt formula list` ile görülen 47 formülü ve her biri için `gt formula show <isim>` çıktısını temel alır. Amaç, formüllerin ne yaptığını, hangi türe girdiğini, kaç adım içerdiğini, hangi değişkenleri kullandığını ve hangi durumda seçilmesi gerektiğini tek yerde toplamaktır.

## Kısa Okuma Rehberi

- `gt formula show` çoğu yürütülebilir formülü `workflow` olarak gösterir.
- Bu rehberde ayrıca bir `operasyonel tür` kullanıyorum:
  - `workflow`: tekil, doğrusal ya da DAG tabanlı iş akışı
  - `task`: bir polecat ya da ajan için net, sınırlı görev şablonu
  - `patrol`: döngüsel, gözlemci, denetleyici iş akışı
  - `expansion`: var olan bir adımı genişleten şablon
  - `aspect`: çapraz kesen davranış; başka adımların etrafına eklenir
  - `convoy`: paralel uzman ayakları olan analiz/review tasarımı

Kısacası:

- `yapısal tür`: `gt formula show`/TOML içindeki gerçek parser tipi
- `operasyonel tür`: pratikte nasıl kullanıldığı

## TOML Yapısı Nasıl Okunur?

GT formülleri TOML dosyalarıyla tanımlanıyor. Kaynak dizin:

```text
/Users/akrotesbot/gt/.beads/formulas
```

En temel workflow iskeleti:

```toml
description = "Kısa açıklama"
formula = "shiny"
type = "workflow"
version = 1

[[steps]]
id = "design"
title = "Design {{feature}}"
description = "Adımın ne yaptığı"
acceptance = "Bitmiş sayılma ölçütü"

[[steps]]
id = "implement"
needs = ["design"]
title = "Implement {{feature}}"

[vars.feature]
description = "The feature being implemented"
required = true
```

Bu yapıdaki ana alanlar:

- `formula`: formül adı
- `description`: insan açıklaması
- `type`: parser türü (`workflow`, `expansion`, `aspect`, `convoy`)
- `version`: şema sürümü
- `[[steps]]`: workflow adımları
- `needs`: bağımlılık
- `[vars.<isim>]`: runtime değişkeni

### Değişken Yerleştirme

Workflow içinde `{{feature}}`, `{{issue}}`, `{{version}}` gibi placeholder'lar kullanılır.

Örnek:

```toml
[vars.version]
description = "The semantic version to release"
required = true
```

Bu değişken adım başlıklarında ve açıklamalarda kullanılabilir:

```toml
title = "Release {{version}}"
```

### Expansion

Expansion, tek bir adımı daha ayrıntılı bir alt akışa genişletir:

```toml
formula = "tdd-cycle"
type = "expansion"

[[template]]
id = "{target}.write-tests"
title = "Write failing tests for: {target.title}"

[[template]]
id = "{target}.implement"
needs = ["{target}.verify-red"]
title = "Implement to green: {target.title}"
```

Burada `template`, hedef adımın yerine geçecek kalıbı tanımlar.

### Aspect

Aspect, bir adımın önüne/arkasına ek davranış yerleştirir:

```toml
formula = "security-audit"
type = "aspect"

[[advice]]
target = "implement"
[advice.around.before]
id = "{step.id}-security-prescan"

[advice.around.after]
id = "{step.id}-security-postscan"
```

Bu yapı "implement adımından önce ve sonra güvenlik kontrolü ekle" anlamına gelir.

### Convoy

Convoy, paralel çalışan uzman ayaklardan oluşur:

```toml
formula = "design"
type = "convoy"

[inputs.problem]
required = true

[[legs]]
id = "api"
title = "API & Interface Design"

[[legs]]
id = "data"
title = "Data Model Design"
```

Burada `legs`, paralel uzman kollarıdır. Workflow adımı gibi seri çalışmazlar; eşzamanlı analiz üretirler.

### Kompozisyon

Bazı formüller başka formülleri genişletir:

```toml
extends = ["shiny"]

[[compose.expand]]
target = "implement"
with = "rule-of-five"
```

Bu şu anlama gelir:

- taban formül `shiny`
- `implement` adımı `rule-of-five` ile genişletiliyor

Aspect kompozisyon örneği:

```toml
[compose]
aspects = ["security-audit"]
```

Parallel konteyner örneği:

```toml
[[steps]]
id = "ensure-witnesses"
type = "parallel"

[[steps.children]]
id = "ensure-gastown-witness"
```

Bu yapı, tek bir üst adım altında paralel alt çocuk adımlar olduğunu gösterir.

## Katalog

## Workflow Formülleri

### Release ve boot

- `beads-release`
  - Amaç: Beads sürüm çıkarma akışını uçtan uca yönetir.
  - Tür: `workflow`
  - Adım sayısı: 18
  - Değişkenler: `version`
  - Ne zaman kullanılır: versiyon bump, changelog, tag, CI ve artifact doğrulaması ile resmi release yapılacaksa.

- `gastown-release`
  - Amaç: Gas Town release akışını workspace temizliği ve daemon restart dahil yürütür.
  - Tür: `workflow`
  - Adım sayısı: 14
  - Değişkenler: `version`
  - Ne zaman kullanılır: Gas Town için sürüm çıkarılacağı zaman.

- `mol-gastown-boot`
  - Amaç: Mayor tarafından town boot sürecini doğrulama kapılı şekilde çalıştırır.
  - Tür: `workflow`
  - Adım sayısı: 9
  - Değişkenler: `yok`
  - Ne zaman kullanılır: daemon, deacon, witness ve refinery oturumları kontrollü biçimde ayağa kaldırılacaksa.

- `mol-town-shutdown`
  - Amaç: Gas Town'u kontrollü biçimde durdurup yeniden başlatma akışını yönetir.
  - Tür: `workflow`
  - Adım sayısı: 8
  - Değişkenler: `shutdown_reason`
  - Ne zaman kullanılır: town genelinde planlı kapatma, bakım ya da toparlanma gerekiyorsa.

### Convoy ve koordinasyon

- `mol-convoy-cleanup`
  - Amaç: tamamlanmış convoy'ları özetler, arşivler ve overseer'a bildirir.
  - Tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `convoy`, `contributor_list`, `duration`, `generated_summary`, `issue_count`, `work_duration`
  - Ne zaman kullanılır: bir convoy'daki tüm işler kapandıktan sonra kapanış ve arşivleme yapılacaksa.

- `mol-convoy-feed`
  - Amaç: ready işi olan ama işçisiz kalmış convoy'lara polecat dispatch eder.
  - Tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `convoy`, `available_count`, `dispatch_count`, `error`, `error_count`, `issue_id`, `polecat`, `ready_count`, `report_summary`, `rig`, `title`
  - Ne zaman kullanılır: stranded convoy bulunduğunda işlerin yeniden akması gerekiyorsa.

- `mol-dep-propagate`
  - Amaç: bir rig'de kapanan işin diğer rig'lerde çözdüğü bağımlılıkları yayar.
  - Tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `resolved_issue`, `dependent_count`, `witness_list`
  - Ne zaman kullanılır: cross-rig dependency çözülünce blokajların güncellenmesi gerekiyorsa.

- `mol-digest-generate`
  - Amaç: Mayor için günlük/haftalık faaliyet özeti üretir.
  - Tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `period`, `date`, `formatted_digest`, `polecat`, `since`, `until`
  - Ne zaman kullanılır: periyodik operasyon özeti üretilecekse.

- `mol-idea-to-plan`
  - Amaç: serbest problem anlatımını PRD, review, plan ve beads üretimine kadar taşır.
  - Tür: `workflow`
  - Adım sayısı: 14
  - Değişkenler: `problem`, `context`, `review_id`
  - Ne zaman kullanılır: belirsiz bir fikri uygulanabilir plan ve bead setine çevirmek istiyorsanız.

- `mol-orphan-scan`
  - Amaç: orphan work tespiti, sınıflandırması ve yeniden atamasını yapar.
  - Tür: `workflow`
  - Adım sayısı: 8
  - Değişkenler: `scope`, `action`, `action_summary`, `burn_count`, `escalate_count`, `escalations_section`, `id`, `issue_count`, `mol_count`, `reason`, `reassign_count`, `recover_count`, `report`, `reset_count`, `timestamp`, `total_count`, `type`, `wisp_count`
  - Ne zaman kullanılır: sahipsiz, yarım kalmış veya kaybolmuş işler sistematik biçimde toparlanacaksa.

- `mol-session-gc`
  - Amaç: eski session'ları temizler ve garbage collection yapar.
  - Tür: `workflow`
  - Adım sayısı: 6
  - Değişkenler: `wisp_type`, `mode`, `age`, `bytes_freed`, `error`, `identifier`, `item`, `reason`, `report`, `timestamp`, `total_cleaned`, `type`
  - Ne zaman kullanılır: uzun süredir biriken session/state çöplerini temizlemek gerektiğinde.

- `mol-sync-workspace`
  - Amaç: batch hazırlığı için workspace senkronizasyonu yapar.
  - Tür: `workflow`
  - Adım sayısı: 10
  - Değişkenler: `setup_command`, `typecheck_command`, `lint_command`, `test_command`, `build_command`
  - Ne zaman kullanılır: polecat ya da batch çalışmasından önce workspace'i temiz ve doğrulanmış hale getirmek gerektiğinde.

- `mol-shutdown-dance`
  - Amaç: Dogs için death warrant icrasını bir durum makinesi olarak yürütür.
  - Tür: `workflow`
  - Adım sayısı: 10
  - Değişkenler: `warrant_id`, `target`, `reason`, `requester`
  - Ne zaman kullanılır: belirli bir dog kontrollü ve izlenebilir biçimde kapatılacaksa.

### Dog / bakım iş akışları

- `mol-dog-backup`
  - Amaç: Dolt backup sync ve offsite kopyalama yapar.
  - Tür: `workflow`
  - Adım sayısı: 3
  - Değişkenler: `databases`, `duration`, `error`, `name`, `offsite_status`, `status`, `synced_count`, `total_count`
  - Ne zaman kullanılır: üretim veritabanlarının düzenli yedeklenmesi gerektiğinde.

- `mol-dog-checkpoint`
  - Amaç: aktif polecat worktree'lerinde WIP checkpoint commit üretir.
  - Tür: `workflow`
  - Adım sayısı: 3
  - Değişkenler: `yok`
  - Ne zaman kullanılır: çökme/kayıp riskine karşı dirty worktree'ler otomatik korunacaksa.

- `mol-dog-compactor`
  - Amaç: Dolt commit geçmişini flatten/surgical modlarında sıkıştırır.
  - Tür: `workflow`
  - Adım sayısı: 4
  - Değişkenler: `commit_threshold`, `databases`, `keep_recent`, `mode`
  - Ne zaman kullanılır: commit graph şiştiğinde ve storage/performans maliyeti düşürülmek istendiğinde.

- `mol-dog-doctor`
  - Amaç: Dolt server health, latency, disk ve orphan durumlarını denetler.
  - Tür: `workflow`
  - Adım sayısı: 3
  - Değişkenler: `backup_status`, `category`, `conn_count`, `conn_max`, `conn_pct`, `disk_usage`, `latency`, `latency_threshold`, `message`, `name`, `orphan_count`, `port`, `server_status`
  - Ne zaman kullanılır: Dolt veri düzlemi sağlığı gözlemlenecekse.

- `mol-dog-jsonl`
  - Amaç: Dolt tablolarını JSONL olarak export edip git archive'a push eder.
  - Tür: `workflow`
  - Adım sayısı: 4
  - Değişkenler: `databases`, `error`, `exported_count`, `max_push_failures`, `name`, `push_status`, `record_count`, `records`, `scrub`, `spike_threshold`, `tables`, `total_count`
  - Ne zaman kullanılır: insan okunur, git tabanlı veri arşivi üretilecekse.

- `mol-dog-phantom-db`
  - Amaç: server'ı çökerten phantom database dizinlerini saptayıp quarantine eder.
  - Tür: `workflow`
  - Adım sayısı: 3
  - Değişkenler: `data_dir`, `name`, `phantom_count`, `phantom_names`, `quarantined_count`, `scan_count`, `valid_count`
  - Ne zaman kullanılır: `.dolt-data` altında bozuk phantom klasör birikimi şüphesi varsa.

- `mol-dog-reaper`
  - Amaç: stale wisps, closed mail ve stale issue temizliği yapar.
  - Tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `alert_threshold`, `databases`, `dolt_port`, `dry_run`, `mail_delete_age`, `max_age`, `purge_age`, `stale_issue_age`
  - Ne zaman kullanılır: veri hijyeni ve biriken stale kayıtların temizliği gerektiğinde.

- `mol-dog-stale-db`
  - Amaç: test/orphan database birikimini saptar ve temizler.
  - Tür: `workflow`
  - Adım sayısı: 3
  - Değişkenler: `max_orphans_for_sql`, `name`, `orphan_count`, `port`, `prod_count`, `remaining_count`, `removed_count`, `size`, `total_count`, `warn_threshold`
  - Ne zaman kullanılır: SHOW DATABASES içinde test/orphan database şişmesi görüldüğünde.

### Genel mühendislik workflow'ları

- `shiny`
  - Amaç: design -> implement -> review -> test -> submit akışını standartlaştırır.
  - Tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `assignee`, `feature`
  - Ne zaman kullanılır: küçük/orta ölçekli özellik geliştirmede temel güvenli varsayılan akış istendiğinde.

- `shiny-enterprise`
  - Amaç: `shiny` üzerine `rule-of-five` genişlemesini ekler.
  - Tür: `workflow`
  - Adım sayısı: `0 doğrudan adım`; kompozisyon: `shiny` + `rule-of-five`
  - Değişkenler: `shiny`'den miras alınır (`assignee`, `feature`)
  - Ne zaman kullanılır: implement adımının çok iterasyonlu, editorial kalitede geçmesi isteniyorsa.

- `shiny-secure`
  - Amaç: `shiny` workflow'una `security-audit` aspect'i uygular.
  - Tür: `workflow`
  - Adım sayısı: `0 doğrudan adım`; kompozisyon: `shiny` + `security-audit`
  - Değişkenler: `shiny`'den miras alınır (`assignee`, `feature`)
  - Ne zaman kullanılır: standart feature akışında güvenlik taramaları ön/arka kanca olarak eklenecekse.

## Patrol Formülleri

- `mol-boot-triage`
  - Amaç: daemon tick başına Deacon için start/wake/nudge/interrupt kararını verir.
  - Tür: `patrol`
  - Yapısal tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `yok`
  - Ne zaman kullanılır: Deacon sağlık kararını mekanik eşiklerle değil bağlamlı gözlemle vermek istendiğinde.

- `mol-deacon-patrol`
  - Amaç: Mayor'ın arka plan devriyesi olarak callback, health, cleanup ve dispatch işlerini yürütür.
  - Tür: `patrol`
  - Yapısal tür: `workflow`
  - Adım sayısı: 26
  - Değişkenler: `idle_effort_threshold`, `wisp_type`
  - Ne zaman kullanılır: town genelinde merkezî orchestration ve bakım döngüsü gerektiğinde.

- `mol-pr-feedback-patrol`
  - Amaç: açık PR'lerde review feedback ve failing CI tespiti yapıp bead/polecat dispatch eder.
  - Tür: `patrol`
  - Yapısal tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `base_branch`, `exclude_drafts`, `max_open_beads`, `patrol_label`, `repo`, `rig`, `scan_interval_seconds`, `wisp_type`
  - Ne zaman kullanılır: GitHub tarafındaki açık PR geri bildirimleri gözden kaçmasın isteniyorsa.

- `mol-refinery-patrol`
  - Amaç: merge queue'yu işler, rebase/test/review/merge akışını yürütür.
  - Tür: `patrol`
  - Yapısal tür: `workflow`
  - Adım sayısı: 13
  - Değişkenler: `build_command`, `delete_merged_branches`, `idle_effort_threshold`, `integration_branch_auto_land`, `integration_branch_refinery_enabled`, `judgment_enabled`, `lint_command`, `merge_strategy`, `prefix`, `require_review`, `review_depth`, `rig`, `run_tests`, `setup_command`, `target_branch`, `test_command`, `typecheck_command`, `wisp_type`
  - Ne zaman kullanılır: refinery ajanı merge kuyruğunu sürekli ve kural tabanlı işleyecekse.

- `mol-witness-patrol`
  - Amaç: rig bazında polecat sağlık, cleanup, escalation ve swarm takibini yapar.
  - Tür: `patrol`
  - Yapısal tür: `workflow`
  - Adım sayısı: 9
  - Değişkenler: `idle_effort_threshold`, `prefix`, `rig`, `wisp_type`
  - Ne zaman kullanılır: bir rig içindeki worker gözetimi ve operatörlük gerektiğinde.

## Task Formülleri

- `mol-polecat-code-review`
  - Amaç: kodu inceleyip bulguları bead olarak raporlar; kod yazmaz.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 7
  - Değişkenler: `focus`, `issue`, `rig`, `scope`
  - Ne zaman kullanılır: bir kod bölgesinde bulgu odaklı review yapılacaksa.

- `mol-polecat-conflict-resolve`
  - Amaç: merge conflict yaşayan polecat işi için çözüm akışı sağlar.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 9
  - Değişkenler: `base_branch`, `branch`, `original_mr`, `task`
  - Ne zaman kullanılır: refinery veya rebase aşamasında conflict çıkınca onarım gerekiyorsa.

- `mol-polecat-lease`
  - Amaç: Witness tarafından tek bir polecat yaşam döngüsünü izlemek için kullanılır.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 5
  - Değişkenler: `issue`, `polecat`, `rig`
  - Ne zaman kullanılır: belirli bir polecat için kiralama/yaşam döngüsü takibi gerekiyorsa.

- `mol-polecat-review-pr`
  - Amaç: dış katkıcı PR'ını inceleyip approve/reject/revise kararı üretir.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 7
  - Değişkenler: `issue`, `pr_url`, `rig`
  - Ne zaman kullanılır: dış bir PR için insan yerine yapılandırılmış ajan review'u isteniyorsa.

- `mol-polecat-work`
  - Amaç: standart polecat implementasyon işini assignment'tan `gt done`'a kadar götürür.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 8
  - Değişkenler: `base_branch`, `build_command`, `issue`, `lint_command`, `setup_command`, `test_command`, `typecheck_command`
  - Ne zaman kullanılır: tipik bir issue bir polecat'e verilip self-cleaning model ile çözdürülecekse.

- `mol-polecat-work-monorepo`
  - Amaç: monorepo iş akışında CI ve AI review handling eklenmiş polecat çalışma şablonu sunar.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 10
  - Değişkenler: `base_branch`, `build_command`, `issue`, `lint_command`, `setup_command`, `test_command`, `typecheck_command`
  - Ne zaman kullanılır: monorepo içinde PR, CI ve reviewer yorumlarıyla birlikte tam iş döngüsü gerekiyorsa.

- `mol-polecat-work-monorepo-tdd`
  - Amaç: monorepo polecat işine `tdd-cycle` genişlemesi ekler.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: `0 doğrudan adım`; kompozisyon: `mol-polecat-work-monorepo` + `tdd-cycle`
  - Değişkenler: `mol-polecat-work-monorepo`'dan miras alınır
  - Ne zaman kullanılır: monorepo işinde implement adımını red-green-refactor olarak yürütmek istiyorsanız.

- `towers-of-hanoi`
  - Amaç: önceden hesaplanmış adımlarla crash-recovery/durability kanıtı üretir.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 9
  - Değişkenler: `auxiliary_peg`, `source_peg`, `target_peg`
  - Ne zaman kullanılır: uzun mekanik işlerde molecule state'in tek kaynak olduğu dayanıklılık modelini sınamak için.

- `towers-of-hanoi-7`
  - Amaç: 7 diskli büyük durability proof senaryosu çalıştırır.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 129
  - Değişkenler: `yok`
  - Ne zaman kullanılır: daha uzun seri adımlarda restart/handoff dayanımını sınamak istediğinizde.

- `towers-of-hanoi-9`
  - Amaç: 9 diskli daha büyük durability proof senaryosu çalıştırır.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 513
  - Değişkenler: `yok`
  - Ne zaman kullanılır: yüzlerce adımlık mekanik workflow dayanıklılığını test etmek için.

- `towers-of-hanoi-10`
  - Amaç: 10 diskli, 1023 hamlelik dev proof senaryosu çalıştırır.
  - Tür: `task`
  - Yapısal tür: `workflow`
  - Adım sayısı: 1025
  - Değişkenler: `yok`
  - Ne zaman kullanılır: çok uzun ölçekli crash-recovery ve handoff davranışını zorlamak için.

## Expansion Formülleri

- `rule-of-five`
  - Amaç: tek bir hedef adımı 5 iterasyonlu kalite rafine döngüsüne genişletir.
  - Tür: `expansion`
  - Adım sayısı: 5 şablon adımı
  - Değişkenler: `yok`; `{target.*}` bağlamını kullanır
  - Ne zaman kullanılır: draft -> correctness -> clarity -> edge cases -> excellence biçiminde editorial kalite isteniyorsa.

- `tdd-cycle`
  - Amaç: hedef adımı red-green-refactor TDD döngüsüne çevirir.
  - Tür: `expansion`
  - Adım sayısı: 5 şablon adımı
  - Değişkenler: `yok`; `{target.*}` bağlamını kullanır
  - Ne zaman kullanılır: testler önce yazılmalı, implementation sonra gelmeli ve refactor ayrı görülmeli ise.

## Aspect Formülü

- `security-audit`
  - Amaç: `implement` ve `submit` adımlarının önüne/arkasına güvenlik taraması yerleştirir.
  - Tür: `aspect`
  - Adım sayısı: 2 advice hedefi, 2 pointcut
  - Değişkenler: `yok`; `{step.*}` bağlamını kullanır
  - Ne zaman kullanılır: güvenlik prescan/postscan davranışını mevcut workflow'a dokumak istediğinizde.

## Convoy Formülleri

- `code-review`
  - Amaç: correctness, performance, security gibi 10 uzman ayakla paralel kod incelemesi yapar.
  - Tür: `convoy`
  - Paralel ayak sayısı: 10
  - Değişkenler/girdiler: `pr`, `files`, `branch`
  - Ne zaman kullanılır: geniş kapsamlı, çok boyutlu code review gerektiğinde.

- `design`
  - Amaç: API, data, UX, scale, security, integration boyutlarında paralel tasarım analizi üretir.
  - Tür: `convoy`
  - Paralel ayak sayısı: 6
  - Değişkenler/girdiler: `problem`, `context`, `scope`
  - Ne zaman kullanılır: uygulamaya geçmeden önce seçenekli tasarım üretmek istediğinizde.

- `mol-plan-review`
  - Amaç: implementation plan'i completeness, sequencing, risk, scope-creep ve testability açısından paralel değerlendirir.
  - Tür: `convoy`
  - Paralel ayak sayısı: 5
  - Değişkenler/girdiler: `plan`, `problem`, `prd_review`
  - Ne zaman kullanılır: plan bead'lere dönmeden önce kalite kapısı gerekiyorsa.

- `mol-prd-review`
  - Amaç: PRD/fikir metnini requirements, gaps, ambiguity, feasibility, scope ve stakeholders açısından paralel inceler.
  - Tür: `convoy`
  - Paralel ayak sayısı: 6
  - Değişkenler/girdiler: `problem`, `context`
  - Ne zaman kullanılır: implementasyon öncesi açık soruları ve belirsizlikleri çıkarmak istediğinizde.

## Hızlı Seçim Rehberi

- Release çıkaracaksanız: `beads-release`, `gastown-release`
- Town ayağa kalkacak ya da kapanacaksa: `mol-gastown-boot`, `mol-town-shutdown`
- Sürekli gözlem gerekiyorsa: `mol-deacon-patrol`, `mol-witness-patrol`, `mol-refinery-patrol`, `mol-pr-feedback-patrol`, `mol-boot-triage`
- Polecat'e iş verecekseniz: `mol-polecat-work`, `mol-polecat-work-monorepo`, `mol-polecat-work-monorepo-tdd`
- Sadece analiz/review isteniyorsa: `mol-polecat-code-review`, `mol-polecat-review-pr`, `code-review`, `mol-plan-review`, `mol-prd-review`, `design`
- Mevcut workflow'u güçlendirmek istiyorsanız:
  - iterasyon kalitesi için `rule-of-five`
  - TDD için `tdd-cycle`
  - güvenlik için `security-audit`
- Operasyonel bakım için: `mol-dog-*`, `mol-session-gc`, `mol-orphan-scan`

## Notlar

- `shiny-enterprise`, `shiny-secure` ve `mol-polecat-work-monorepo-tdd` doğrudan kendi `steps` listelerini taşımıyor; kompozisyon ile davranış ekliyorlar.
- `mol-gastown-boot` içinde paralel container adımları var; bu yüzden dosyada 5 üst adım olsa da `gt formula show` toplam 9 görünür adım gösteriyor.
- `towers-of-hanoi-*` ailesi gerçek iş çözmek için değil, uzun mekanik workflow dayanıklılığını kanıtlamak için tasarlanmış.
- Convoy ve aspect formüllerinde "adım" yerine pratikte `legs`, `template` ya da `advice` sayısı daha anlamlıdır.
