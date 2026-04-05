# Adım 0 Faz 0 Revizyonu Code Review

## Genel Sonuç

Bu revizyonda mimari yön doğru: tool registry tek merkezde toplanmış, `route.ts` inline tool objeleri üretmiyor, chat tarafında kalıcılık için `chat_sessions` ve `chat_messages` yazımı eklenmiş, `proxy.ts` de Next 16 `proxy` formatına çevrilmiş. Ancak uygulama akışını fiilen kırabilecek iki temel problem var:

1. Auth kimliği ile uygulama profil kimliği karışmış. Chat session kayıtları `auth.users.id` ile yazılıyor, şema ise `public.users.id` bekliyor. Bu yüzden chat persistence pratikte hata verebilir.
2. Signup akışı tenant claim/bootstrap sıralamasını tamamlamıyor. `tenant` ve `tenant_membership` oluşturuluyor ama `public.users` profili oluşturulmuyor; ayrıca claim güncellemesinden sonra kullanıcının aktif oturumu yenilenmediği için `redirect("/dashboard")` sonrası tenant context eksik kalabilir.

Bu nedenle revizyonun mevcut hali prod için hazır değil. Genel not: **C-**

## Öncelikli Bulgular

### 1. Chat persistence, yanlış `user_id` yüzünden sessizce düşebilir
- Seviye: Kritik
- Dosyalar:
  [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/app/api/chat/route.ts#L48)
  [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/app/api/chat/route.ts#L67)
  [src/lib/chat/chat-store.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/chat/chat-store.ts#L61)
  [supabase/migrations/00001_create_schema.sql](/Users/akrotesbot/gt/akos/polecats/vault/akos/supabase/migrations/00001_create_schema.sql#L240)
- `route.ts`, `userId` olarak `session.user.id` kullanıyor. Bu değer `auth.users.id`.
- `chat_sessions.user_id` ise `public.users(id)` foreign key’ine bağlı.
- `saveChatSession()` bu `auth.users.id` değerini doğrudan `chat_sessions.user_id` alanına yazıyor.
- Sonuç: `public.users` içinde aynı ID ile row yoksa insert/upsert FK hatası verir. Hata `route.ts` içinde loglanıp yutulduğu için kullanıcı chat’i çalışıyor sanabilir ama veri kalıcı olmaz.

### 2. Signup akışı `public.users` profilini üretmiyor; sonraki akışlar kırılıyor
- Seviye: Kritik
- Dosyalar:
  [src/lib/auth/signup.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/auth/signup.ts#L100)
  [src/lib/auth/signup.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/auth/signup.ts#L127)
  [src/lib/chat/chat-store.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/chat/chat-store.ts#L23)
  [src/lib/auth/get-session.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/auth/get-session.ts#L42)
- Signup sırasında tenant oluşturuluyor ve `tenant_memberships` kaydı açılıyor.
- Fakat `public.users` tablosuna hiçbir profil satırı insert edilmiyor.
- Oysa chat session FK’si, `getChatSessions()`, site raporu ve genel uygulama modeli `public.users` tablosuna dayanıyor.
- Bu eksik profil yaratımı yüzünden signup başarılı görünse bile sonraki domain işlemleri parçalı biçimde bozulur.

### 3. Signup sonrası tenant claim aktif oturuma yansımayabilir
- Seviye: Yüksek
- Dosyalar:
  [src/lib/auth/signup.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/auth/signup.ts#L116)
  [src/app/(auth)/kayit/actions.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/app/(auth)/kayit/actions.ts#L33)
  [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/app/api/chat/route.ts#L40)
  [supabase/migrations/00002_enable_rls.sql](/Users/akrotesbot/gt/akos/polecats/vault/akos/supabase/migrations/00002_enable_rls.sql#L7)
- Tenant context tamamen JWT `app_metadata.tenant_id` claim’ine bağlı.
- Signup içinde claim admin API ile güncelleniyor, hemen ardından kullanıcı `/dashboard`’a redirect ediliyor.
- Bu noktada mevcut session JWT’si eski claim ile kalabilir. Route ve RLS katmanı tenant claim olmadan çalışmadığı için ilk request’lerde 403/boş veri davranışı görülebilir.
- En azından oturumu refresh eden bir adım veya yeniden login/OTP sonrası giriş akışı gerekli.

### 4. Chat erişimi tenant bazlı, kullanıcı bazlı değil; aynı tenant içinde yatay veri sızıntısı mümkün
- Seviye: Yüksek
- Dosyalar:
  [supabase/migrations/00002_enable_rls.sql](/Users/akrotesbot/gt/akos/polecats/vault/akos/supabase/migrations/00002_enable_rls.sql#L177)
  [supabase/migrations/00002_enable_rls.sql](/Users/akrotesbot/gt/akos/polecats/vault/akos/supabase/migrations/00002_enable_rls.sql#L193)
  [src/lib/chat/chat-store.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/chat/chat-store.ts#L139)
  [src/lib/chat/chat-store.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/chat/chat-store.ts#L125)
- `chat_sessions` ve `chat_messages` RLS policy’leri yalnızca `tenant_id = get_tenant_id()` kontrolü yapıyor.
- `getChatMessages(sessionId)` kullanıcı ownership kontrolü yapmadan sadece `session_id` ile okuyor.
- Session ID tahmin edilmesi veya tenant içi sızması halinde kullanıcılar birbirlerinin sohbetlerini okuyabilir.
- `saveChatSession(... upsert onConflict: "id")` de aynı nedenle başka kullanıcının session satırını overwrite etmeye açık.

### 5. `tenants` / `tenant_memberships` RLS var ama bootstrap modeli kullanıcı akışına uygun değil
- Seviye: Orta
- Dosyalar:
  [supabase/migrations/00003_tenants_and_profiles.sql](/Users/akrotesbot/gt/akos/polecats/vault/akos/supabase/migrations/00003_tenants_and_profiles.sql#L75)
  [supabase/migrations/00003_tenants_and_profiles.sql](/Users/akrotesbot/gt/akos/polecats/vault/akos/supabase/migrations/00003_tenants_and_profiles.sql#L91)
- İstenen kriter karşılanıyor: `tenants` ve `tenant_memberships` için policy mevcut.
- Ancak `tenants_insert with check (id = get_tenant_id())` normal bir kullanıcının ilk tenant’ını RLS altından oluşturmasına izin vermiyor; bu ancak service role ile çalışıyor.
- Mevcut signup akışı zaten service role kullanıyor. Dolayısıyla teknik olarak çalışabilir, fakat bu tasarım “ilk tenant bootstrap” için açık ve dokümante edilmiş değil.

### 6. Tool registry tek kaynak, ama prompt içinde tool isimleri kopyalanmış
- Seviye: Düşük
- Dosyalar:
  [src/lib/ai/tools/index.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/ai/tools/index.ts#L34)
  [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/app/api/chat/route.ts#L22)
- Gerçek tool tanımı registry’de. `route.ts` içinde inline `tool({...})` yok; bu kriter olumlu.
- Yine de `SYSTEM_PROMPT` içinde mevcut tool listesi elle yazılmış. Registry değişirse prompt metni drift eder.
- Bu bir correctness bug değil, bakım riski.

### 7. Type safety bazı noktalarda bilinçli olarak by-pass edilmiş
- Seviye: Düşük
- Dosyalar:
  [src/lib/ai/tools/index.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/ai/tools/index.ts#L42)
  [src/lib/ai/tools/index.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/ai/tools/index.ts#L47)
  [src/lib/supabase/database.types.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/lib/supabase/database.types.ts#L1)
- `inputSchema as never` ve sonuçta `as ToolSet` kullanımı strict TypeScript güvencesini düşürüyor.
- `database.types.ts` yalnızca sınırlı tablo setini içeriyor; AI tool sorguları typed client kullanmadığı için şema drift’i derleme zamanında yakalanmıyor.

## Kriter Bazlı Değerlendirme

1. Tool registry tek kaynak mı? `route.ts`'de inline tool tanımı kaldı mı?
   Sonuç: **Evet, büyük ölçüde tek kaynak.**
   `getTools()` registry’den üretiyor. `route.ts` içinde inline tool objesi yok. Yalnız prompt içinde tool isimleri kopya halde duruyor.

2. Tenant context doğru mu? Her tool `execute`'a `supabase + tenantId + userId` geçiyor mu?
   Sonuç: **Evet.**
   [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/vault/akos/src/app/api/chat/route.ts#L89) üç alanı da geçiriyor. `createProject` bunları kullanıyor; `getDashboard` ise `tenantId` ve `userId`’yi fiilen kullanmıyor, RLS’ye güveniyor.

3. Chat kalıcılığı: mesajlar `chat_sessions` / `chat_messages`'a yazılıyor mu?
   Sonuç: **Kod niyeti evet, pratikte riskli.**
   Yazım çağrıları var; fakat yanlış `user_id` modeli nedeniyle session insert/upsert düşebilir ve hata swallow edildiği için sessiz veri kaybı yaşanır.

4. RLS policy'leri tutarlı mı? `tenants` ve `tenant_memberships` için policy var mı?
   Sonuç: **Var, ama chat ownership zayıf.**
   `tenants` ve `tenant_memberships` policy’leri mevcut. Ancak chat policy’leri tenant scope ile sınırlı; user scope yok.

5. Auth flow: signup sırasında tenant oluşturuluyor mu, claim set ediliyor mu?
   Sonuç: **Kısmen.**
   Tenant oluşturuluyor, claim set ediliyor, membership açılıyor. Ama `public.users` profili oluşturulmuyor ve claim aktif session’a garanti biçimde yansıtılmıyor.

6. `proxy.ts`: `middleware.ts`'den doğru dönüştürülmüş mü?
   Sonuç: **Evet.**
   Next 16 için `src/proxy.ts` + `export async function proxy(...)` biçimi doğru görünüyor. Bu dosyada belirgin dönüşüm hatası yok.

7. Güvenlik: SQL injection riski, XSS, eksik auth kontrolü var mı?
   Sonuç: **SQL injection ve klasik XSS görünmüyor; auth/authorization açığı var.**
   Query builder kullanıldığı için doğrudan SQL injection riski düşük. React text rendering nedeniyle bu dosyalarda doğrudan XSS da görünmüyor. Asıl açık, chat oturumlarının yalnız tenant bazlı korunması.

8. Kod kalitesi: TypeScript strict uyumu, gereksiz `any`, eksik hata yönetimi
   Sonuç: **Orta.**
   Hedef dosyalarda kaba `any` yok. Ancak tip güvenliği `as never` / `as ToolSet` ile zayıflatılmış. Chat persistence hatalarının swallow edilmesi gözlemlenebilirliği azaltıyor.

## Dosya Bazlı Notlar

| Dosya | Not | Değerlendirme |
|---|---|---|
| `supabase/migrations/00003_tenants_and_profiles.sql` | **C** | Policy’ler var ama bootstrap modeli service-role bağımlı; `tenant_memberships.user_id` ile uygulama tarafındaki `public.users` modeli arasında kopukluk var. |
| `src/lib/auth/signup.ts` | **D** | Tenant ve membership oluşturuyor ama `public.users` profilini oluşturmuyor; claim güncellemesi sonrası session refresh yok. |
| `src/lib/auth/get-session.ts` | **C** | Membership rolünü doğru okuyor; fakat tüm model `app_metadata.tenant_id` claim’inin güncel olmasına bağımlı. |
| `src/lib/supabase/server.ts` | **B** | SSR client kurulumu temiz; belirgin bug görünmüyor. |
| `src/app/(auth)/kayit/actions.ts` | **C** | Basit ve temiz; ancak signup sonrası doğrudan `/dashboard` redirect’i claim refresh problemiyle çatışıyor. |
| `src/lib/ai/tools/createProject.ts` | **B** | Tenant context ile insert yapıyor; query builder güvenli. Küçük bakım/typed-client eksikleri dışında sorun yok. |
| `src/lib/ai/tools/getDashboard.ts` | **B-** | Context geçiriliyor ama kullanılmıyor; sonuçlar tamamen RLS’ye dayanıyor. İşlevsel olarak kabul edilebilir. |
| `src/lib/ai/tools/index.ts` | **B** | Registry tek kaynak olmuş; `as never` / `as ToolSet` strict tip değerini düşürüyor. |
| `src/app/api/chat/route.ts` | **D** | Tool registry kullanımı doğru; ancak chat persistence için yanlış `userId` modeli, hata swallow etme ve authorization boşlukları var. |
| `src/lib/chat/chat-store.ts` | **D** | Chat DB erişimi var ama ownership enforcement yok; `public.users` çözümü ile session yazımı arasında model tutarsızlığı mevcut. |
| `src/lib/chat/chat-ui.ts` | **A-** | Basit, temiz, güvenli yardımcılar. |
| `src/components/chat/chat-sidebar.tsx` | **A-** | Temiz UI bileşeni; review kriterleri açısından problem görünmüyor. |
| `src/components/chat/chat-page-client.tsx` | **B-** | Session yönetimi makul; ancak backend persistence hataları UI tarafından fark edilmiyor. |
| `src/proxy.ts` | **A-** | `middleware` -> `proxy` dönüşümü doğru görünüyor. |
| `src/lib/supabase/database.types.ts` | **C** | Temel tablolar mevcut ama kapsam dar; typed safety sınırlı ve AI tool sorguları bu tiplerden yeterince faydalanmıyor. |

## Öncelikli Düzeltme Listesi

1. Auth kimliği ile `public.users` profil kimliğini netleştirin. İki seçenekten biri seçilmeli:
   - `public.users.id = auth.users.id` olacak şekilde signup sırasında profil row’u yaratın.
   - Ya da chat/session şemasını `auth.users` ile tutarlı hale getirin.
2. Signup transaction benzeri bir bootstrap akışı kurun:
   - tenant
   - tenant_membership
   - public user profile
   - claim update
   - session refresh / yeniden giriş
3. Chat authorization’ı tenant değil kullanıcı ownership bazına taşıyın:
   - `chat_sessions.user_id = current_user_profile_id`
   - `chat_messages` erişimini parent session ownership’i ile sınırlandırın.
4. `saveChatSession` ve `saveChatMessage` hatalarını swallow etmeyin. Kullanıcıya geri dönün veya en azından request’i failed yapın.
5. `route.ts` içindeki tool capability prompt’unu registry’den türetin veya minimumda tek yerde tutun.
6. `database.types.ts` üretimini otomatikleştirin ve AI tool sorgularını typed Supabase client ile çalıştırın.

## Test Notu

`vitest` ile şu testleri çalıştırdım ve hepsi geçti:

- `src/lib/chat/__tests__/chat-store.test.ts`
- `src/lib/ai/tools/__tests__/index.test.ts`
- `src/lib/ai/tools/__tests__/createProject.test.ts`
- `src/lib/ai/tools/__tests__/getDashboard.test.ts`

Ancak bu testler kritik kimlik/FK ve authorization problemlerini yakalamıyor; çoğu mock tabanlı ve veri modelindeki gerçek ilişkiyi doğrulamıyor.
