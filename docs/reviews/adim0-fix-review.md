# Adım 0 Fix Review

## Genel Sonuç

`e0eb051` önceki review'daki 4 kritik/yüksek bulgunun 2 tanesini etkili biçimde kapatıyor:

1. `auth.users.id` ile `public.users.id` uyumsuzluğu için signup sırasında `public.users` insert'i eklenmiş.
2. Chat RLS artık tenant bazının üstüne kullanıcı ownership kontrolü de ekliyor.

Ama 2 kritik nokta halen kapanmış değil:

1. Signup sonrası JWT/session refresh hâlâ yok.
2. Chat persistence hataları hâlâ request başarısına yansıtılmıyor; sadece log ve header seviyesi sinyal var.

Bu yüzden revizyon önceki `C-` durumundan yukarı çıkıyor ama hâlâ prod-ready değil. Yeni genel not: **C**

## Bulgular

### 1. Signup sonrası tenant claim aktif oturuma yine yansıtılmıyor
- Seviye: Yüksek
- Durum: Açık
- Dosyalar:
  [src/lib/auth/signup.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/lib/auth/signup.ts#L119)
  [src/app/(auth)/kayit/actions.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/(auth)/kayit/actions.ts#L35)
- `signup()` içinde `admin.auth.admin.updateUserById(... app_metadata.tenant_id ...)` çağrısı var, ama ardından mevcut oturum için `refreshSession`, yeniden login veya benzeri bir claim yenileme adımı yok.
- `signupAction()` yalnızca `redirect("/giris")` yapıyor. Bu, yanlış dashboard redirect'ini düzeltmiş ama “claim hemen aktif mi?” problemini çözmüyor.
- Sonuç: kullanıcı kayıt sonrası tekrar giriş yapmak zorunda kalabilir; otomatik giriş veya devam eden session beklentisinde tenant context ilk request'lerde eksik kalabilir.

### 2. Chat hataları artık tamamen görünmez değil, ama hâlâ swallow ediliyor
- Seviye: Orta
- Durum: Kısmen açık
- Dosyalar:
  [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/api/chat/route.ts#L67)
  [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/api/chat/route.ts#L110)
- Incoming persistence hatasında `persistenceFailed = true` set edilip response header'ına `X-Chat-Persistence: failed` yazılıyor. Bu, önceye göre daha iyi.
- Ama request fail edilmiyor, kullanıcıya hata dönülmüyor ve assistant message persistence hatası hâlâ sadece loglanıp bırakılıyor.
- Sonuç: veri kaybı sessiz olmasa da fiilen tolere ediliyor; uygulama başarılı görünürken chat geçmişi eksik kalabilir.

## Önceki 4 Bulgunun Durumu

1. `auth.users.id` vs `public.users.id` uyumsuzluğu
   Sonuç: **Kapanmış.**
   [src/lib/auth/signup.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/lib/auth/signup.ts#L140) artık `public.users` tablosuna `id = auth user id` ile insert yapıyor. Bu, chat FK/RLS modelini düzeltiyor.

2. Signup sonrası JWT claim refresh
   Sonuç: **Kapanmamış.**
   Claim yazılıyor ama aktif oturuma yenileme yok. [src/lib/auth/signup.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/lib/auth/signup.ts#L119), [src/app/(auth)/kayit/actions.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/(auth)/kayit/actions.ts#L35)

3. Chat RLS sadece tenant bazlıydı, user ownership yoktu
   Sonuç: **Büyük ölçüde kapanmış.**
   [supabase/migrations/00004_chat_user_ownership.sql](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/supabase/migrations/00004_chat_user_ownership.sql#L6) ve [supabase/migrations/00004_chat_user_ownership.sql](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/supabase/migrations/00004_chat_user_ownership.sql#L55) chat session/message erişimini `auth.uid()` ownership'i ile sınırlandırıyor.

4. Chat hataları swallow ediliyordu
   Sonuç: **Kısmen kapanmış, tam değil.**
   [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/api/chat/route.ts#L123) header ekliyor, ama persistence failure hâlâ request'i başarısız yapmıyor.

## Kalan Diğer Başlıklar

### Tool registry hâlâ tek kaynak mı?
- Sonuç: **Evet.**
- [src/lib/ai/tools/index.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/lib/ai/tools/index.ts#L34) registry tek merkez.
- [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/api/chat/route.ts#L91) `getTools(...)` kullanıyor; route içinde inline tool tanımı yok.
- Kalan küçük risk: `SYSTEM_PROMPT` içinde tool isimleri hâlâ elle kopyalanmış. Bu correctness bug değil, drift riski.

### Tenant context doğru mu?
- Sonuç: **Evet, ama signup refresh eksiği yüzünden kırılabilir.**
- [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/api/chat/route.ts#L41) tenant claim kontrolü yapıyor.
- [src/app/api/chat/route.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/app/api/chat/route.ts#L91) `supabase + tenantId + userId` tool context'e geçiliyor.
- Ana risk claim'in yazılmış ama henüz session'a taşınmamış olması.

### `proxy.ts` doğru mu?
- Sonuç: **Evet.**
- [src/proxy.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/proxy.ts#L4) Next 16 `proxy` formunu doğru kullanıyor.

### TypeScript strict uyumu
- Sonuç: **İyi, ama tam tip güvenliği değil.**
- [tsconfig.json](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/tsconfig.json#L7) `strict: true`.
- `npx tsc --noEmit` bu workspace'te başarılı geçti.
- Yine de [src/lib/ai/tools/index.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/lib/ai/tools/index.ts#L42) `as never` ve [src/lib/ai/tools/index.ts](/Users/akrotesbot/gt/akos/polecats/mirelurk/akos/src/lib/ai/tools/index.ts#L47) `as ToolSet` ile tip sistemi bilinçli by-pass ediliyor.

## Dosya Bazlı Notlar

| Dosya | Not | Gerekçe |
|---|---|---|
| `src/lib/auth/signup.ts` | **B+** | En kritik eksik olan `public.users` insert'i eklenmiş ve auth/profile ID modeli hizalanmış. Ama claim refresh zinciri hâlâ yok. |
| `src/app/(auth)/kayit/actions.ts` | **D+** | `name` artık signup'a geçiliyor ve yanlış `/dashboard` redirect'i kaldırılmış. Buna rağmen fix hedefi olan session refresh burada yok; bu dosyanın asıl problemi devam ediyor. |
| `supabase/migrations/00004_chat_user_ownership.sql` | **A-** | Chat session/message RLS artık ownership odaklı. Güvenlik açısından önceki duruma göre net iyileşme. |
| `src/app/api/chat/route.ts` | **C** | Gözlemlenebilirlik artmış (`X-Chat-Persistence`), ama persistence hataları hâlâ request sonucuna bağlanmıyor ve assistant save failure tamamen log seviyesinde kalıyor. |

## Karşılaştırma

- Önceki genel not: **C-**
- Yeni genel not: **C**

Not artışının nedeni:
- Kimlik/FK modeli düzelmiş.
- Chat authorization tenant-only olmaktan çıkmış.

Notu daha yukarı taşımayan nedenler:
- Signup sonrası claim/session refresh yok.
- Chat persistence hataları hâlâ fail-fast değil.

## Doğrulama Notu

- İncelenen commit: `e0eb051`
- Type check: `npx tsc --noEmit` başarılı
