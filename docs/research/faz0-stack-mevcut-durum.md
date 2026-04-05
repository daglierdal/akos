# Faz 0 Stack Mevcut Durum Analizi

Tarih: 2026-04-05

## Kapsam

Istenen dosyalar tarandi:

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `.eslintrc` -> bulunamadi
- `tailwind.config.ts` -> bulunamadi

Eksik iki dosya icin repo icinde fiilen kullanilan karsiliklar da incelendi:

- ESLint: `eslint.config.mjs`
- Tailwind/PostCSS: `postcss.config.mjs`, `src/app/globals.css`

Ek olarak Next.js 16 gecisi acisindan su dosyalar tarandi:

- `src/middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/app/api/chat/route.ts`

## Ozet

- Proje zaten `next@16.2.2` seviyesinde. Yani teorik olarak "15 -> 16 upgrade" gecisi tamamlanmis durumda.
- `react@19.2.4`, `react-dom@19.2.4`, `tailwindcss@4.2.2`, `eslint` flat config ve `@tailwindcss/postcss` kullanimda.
- `middleware.ts` halen mevcut. Next.js 16'da yeni konvansiyon `proxy.ts`; bu repo icin codemodun en net aday etkisi bu dosya.
- Async Request APIs tarafinda repo uyumlu gozukuyor: `cookies()` zaten `await` ile kullaniliyor, `headers()`, `draftMode()`, `params`, `searchParams` kullanimina rastlanmadi.
- Turbopack varsayilan oldugu icin `package.json` scriptleri dogru; `--turbopack` veya `--turbo` kullanimi yok.
- Cache semantics tarafinda repo herhangi bir `use cache`, `cacheTag`, `cacheLife`, `unstable_cache`, `revalidateTag`, `dynamicIO`, `cacheComponents` konfigu kullanmiyor.

## Dosya Bazli Durum

### `package.json`

- `next`, `react`, `react-dom` zaten Next 16 uyumlu kombinasyonda.
- `lint` script'i `eslint` CLI kullaniyor. Bu, Next 16 ile kaldirilan `next lint` komutuna takilmadigi anlamina geliyor.
- Tailwind 4 kullanimda: `tailwindcss`, `@tailwindcss/postcss`.

### `tsconfig.json`

- `moduleResolution: "bundler"` ve `strict: true` ile modern Next/TS yapisina uygun.
- `plugins: [{ "name": "next" }]` mevcut.
- Upgrade acisindan acik bir risk gosterisi yok.

### `next.config.ts`

- Dosya minimal.
- `experimental.turbo`, `experimental.turbopack`, `experimental.dynamicIO`, `experimental.ppr`, `eslint`, `serverRuntimeConfig`, `publicRuntimeConfig` gibi Next 16'da sorun yaratabilecek ayarlar yok.

### `eslint.config.mjs`

- Repo legacy `.eslintrc` degil, Flat Config kullaniyor.
- `eslint-config-next/core-web-vitals` ve `eslint-config-next/typescript` aktif.
- Next 16 acisindan ESLint config migrasyonu gerekmiyor.

### `postcss.config.mjs` ve `src/app/globals.css`

- `@tailwindcss/postcss` kullanimi Tailwind 4 yapisiyla uyumlu.
- `src/app/globals.css` icinde `@import "tailwindcss";` ve `@theme inline` kullaniliyor.
- Bu da projede Tailwind 3 degil, Tailwind 4'un CSS-first modelinin kullanildigini gosteriyor.
- `tailwind.config.ts` olmamasi bu repo icin bir eksiklik degil; mevcut kurulumun dogal sonucu.

## Paket Surum Karsilastirmasi

Not: "Mevcut" surumler `package-lock.json` icindeki fiilen kilitlenmis surumden alindi. "Guncel" surumler 2026-04-05 tarihinde `npm view <paket> version` ile cekildi.

| Paket | package.json | Mevcut | Guncel | Durum |
| --- | --- | --- | --- | --- |
| `@ai-sdk/openai` | `^3.0.50` | `3.0.50` | `3.0.50` | guncel |
| `@ai-sdk/react` | `^3.0.147` | `3.0.147` | `3.0.148` | patch geride |
| `@base-ui/react` | `^1.3.0` | `1.3.0` | `1.3.0` | guncel |
| `@supabase/ssr` | `^0.10.0` | `0.10.0` | `0.10.0` | guncel |
| `@supabase/supabase-js` | `^2.101.1` | `2.101.1` | `2.101.1` | guncel |
| `ai` | `^6.0.145` | `6.0.145` | `6.0.146` | patch geride |
| `class-variance-authority` | `^0.7.1` | `0.7.1` | `0.7.1` | guncel |
| `clsx` | `^2.1.1` | `2.1.1` | `2.1.1` | guncel |
| `lucide-react` | `^1.7.0` | `1.7.0` | `1.7.0` | guncel |
| `next` | `16.2.2` | `16.2.2` | `16.2.2` | guncel |
| `react` | `19.2.4` | `19.2.4` | `19.2.4` | guncel |
| `react-dom` | `19.2.4` | `19.2.4` | `19.2.4` | guncel |
| `shadcn` | `^4.1.2` | `4.1.2` | `4.1.2` | guncel |
| `tailwind-merge` | `^3.5.0` | `3.5.0` | `3.5.0` | guncel |
| `tw-animate-css` | `^1.4.0` | `1.4.0` | `1.4.0` | guncel |
| `zod` | `^4.3.6` | `4.3.6` | `4.3.6` | guncel |
| `@tailwindcss/postcss` | `^4` | `4.2.2` | `4.2.2` | guncel |
| `@testing-library/jest-dom` | `^6.9.1` | `6.9.1` | `6.9.1` | guncel |
| `@testing-library/react` | `^16.3.2` | `16.3.2` | `16.3.2` | guncel |
| `@testing-library/user-event` | `^14.6.1` | `14.6.1` | `14.6.1` | guncel |
| `@types/node` | `^20` | `20.19.39` | `25.5.2` | major geride |
| `@types/react` | `^19` | `19.2.14` | `19.2.14` | guncel |
| `@types/react-dom` | `^19` | `19.2.3` | `19.2.3` | guncel |
| `@vitejs/plugin-react` | `^6.0.1` | `6.0.1` | `6.0.1` | guncel |
| `eslint` | `^9` | `9.39.4` | `10.2.0` | major geride |
| `eslint-config-next` | `16.2.2` | `16.2.2` | `16.2.2` | guncel |
| `jsdom` | `^29.0.1` | `29.0.1` | `29.0.1` | guncel |
| `tailwindcss` | `^4` | `4.2.2` | `4.2.2` | guncel |
| `typescript` | `^5` | `5.9.3` | `6.0.2` | major geride |
| `vitest` | `^4.1.2` | `4.1.2` | `4.1.2` | guncel |

## Next.js 15 -> 16 Breaking Change Analizi

Asagidaki maddeler resmi Next.js 16 upgrade dokumantasyonu baz alinarak repo ozelinde yorumlandi.

### 1. `middleware.ts` -> `proxy.ts`

- Next.js 16'da `middleware` dosya konvansiyonu deprecated edildi ve `proxy` olarak yeniden adlandirildi.
- Bu repo icinde aktif entry dosyasi: `src/middleware.ts`
- En belirgin manuel/codemod etkisi burasi.

Repo etkisi:

- `src/middleware.ts` -> `src/proxy.ts` yeniden adlandirilmasi beklenir.
- Icindeki export ismi de `middleware` yerine `proxy` olmalidir.
- `src/lib/supabase/middleware.ts` bir helper dosyasi; framework entrypoint olmadigi icin otomatik olarak degismesi gerekmez. Ancak isimlendirme tutarliligi icin ileride `src/lib/supabase/proxy.ts` gibi bir yeniden adlandirma dusunulebilir.

### 2. Async Request APIs

Next 16 ile su API'lerde sync erisim tamamen kaldirildi:

- `cookies()`
- `headers()`
- `draftMode()`
- `params`
- `searchParams`

Repo etkisi:

- `src/lib/supabase/server.ts` zaten `const cookieStore = await cookies();` kullaniyor. Bu dosya uyumlu.
- `headers()` kullanimina rastlanmadi.
- `draftMode()` kullanimina rastlanmadi.
- `params` / `searchParams` kullanan App Router sayfasi/layout/route bulunmadi.
- `src/app` altinda dinamik route segmenti (`[slug]`, `[id]` vb.) bulunmadi.

Sonuc:

- Bu baslikta codemodun degistirecegi net bir dosya gorunmuyor.
- Async Request APIs acisindan repo zaten Next 16 uyumlu.

### 3. Turbopack varsayilan hale geldi

Next 16 ile `next dev` ve `next build` varsayilan olarak Turbopack kullanir.

Repo etkisi:

- `package.json` scriptleri zaten temiz:
  - `dev: "next dev"`
  - `build: "next build"`
- `--turbopack` veya `--turbo` argumani yok; degisiklik gerekmiyor.
- `next.config.ts` icinde `experimental.turbo` veya `experimental.turbopack` ayari yok; degisiklik gerekmiyor.

### 4. Cache semantics / Cache Components

Next 16 tarafinda cache davranisi daha belirgin sekilde request-time ve opt-in mantigina yaklasti. Ayrica `experimental.dynamicIO` kaldirildi, yerine `cacheComponents` geldi.

Repo etkisi:

- `experimental.dynamicIO` yok.
- `cacheComponents` yok.
- `unstable_cache`, `cacheTag`, `cacheLife`, `revalidateTag`, `updateTag`, `use cache` kullanimina rastlanmadi.
- `fetch` tabanli ozel cache stratejisi de repoda belirgin degil.

Sonuc:

- Cache semantics basligi repo icin bugun "breaking" degil, daha cok gelecekte veri fetch stratejisi tasarlanirken dikkat edilmesi gereken bir alan.
- Bu projede su an cache migrasyonu gerektiren bir kod izi yok.

## `npx @next/codemod upgrade` Calistirmadan Once Etkilenecek Dosyalar

Next.js 16 upgrade codemodunun resmi olarak hedefledigi alanlar:

- `next.config.*` icinde `turbopack` konfig migrasyonu
- `next lint` -> ESLint CLI
- `middleware` -> `proxy`
- stabilize olan API'lerde `unstable_` prefix temizligi
- `experimental_ppr` temizligi

Bu repo icin onceden tespit edilen dosyalar:

### Yüksek olasilikla etkilenecek

- `src/middleware.ts`
  - `proxy.ts` olarak yeniden adlandirma adayi
  - `export async function middleware(...)` -> `export async function proxy(...)`

### Dusuk olasilikla / kontrol edildi ama etki gorulmedi

- `package.json`
  - `next lint` kullanmadigi icin codemod burada buyuk ihtimalle degisiklik yapmaz
- `next.config.ts`
  - `experimental.turbo`, `experimental.turbopack`, `experimental_ppr`, `dynamicIO` olmadigi icin no-op olmasi beklenir
- `src/lib/supabase/server.ts`
  - Async `cookies()` kullandigi icin request API codemoduna aday degil
- `src/app/api/chat/route.ts`
  - `params` / `searchParams` / `headers()` / `cookies()` kullanmadigi icin request API codemoduna aday degil

### Etkilenmesi beklenmeyen ama insan kontrolu gereken dosya

- `src/lib/supabase/middleware.ts`
  - Framework entry dosyasi degil
  - Codemod bunu zorunlu olarak degistirmeyebilir
  - Ancak isimlendirme artik semantik olarak "middleware" yerine "proxy" ile daha uyumlu olabilir

## Tailwind CSS 3 vs 4 Degerlendirmesi

Sorulan soru: "Tailwind CSS 3 -> 4 gecisi gerekiyor mu?"

Kisa cevap: Hayir. Proje zaten Tailwind 4 kullaniyor.

Kanıtlar:

- `package.json` icinde `tailwindcss: ^4`
- `package.json` icinde `@tailwindcss/postcss: ^4`
- `postcss.config.mjs` icinde `@tailwindcss/postcss`
- `src/app/globals.css` icinde `@import "tailwindcss";`
- `src/app/globals.css` icinde `@theme inline`
- `tailwind.config.ts` dosyasinin olmamasi Tailwind 4 icin normal

Yorum:

- Repo Tailwind 3'ten 4'e gecis yapmis gozukuyor.
- Tailwind 3 dokusundan kalan tipik izler olan `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` veya zorunlu `tailwind.config.*` ihtiyaci burada yok.

## ESLint Flat Config Gecisi Gerekiyor mu?

Kisa cevap: Hayir.

Sebep:

- `.eslintrc` yok
- `eslint.config.mjs` var
- `defineConfig` tabanli Flat Config kullaniliyor
- Next.js 16 dokumantasyonu da legacy `.eslintrc` kullanan projelerin flat config'e gecmesini oneriyor; bu repo o migrasyonu zaten yapmis

Ek not:

- `lint` script'i dogrudan `eslint` CLI cagiriyor. Bu da Next 16 ile kaldirilan `next lint` komutundan etkilenmedigini gosteriyor.

## Teknik Riskler ve Notlar

- Repo Next 16'da oldugu halde entry dosyasi halen `src/middleware.ts`. Bu, bugun calisiyor olsa bile deprecation borcu tasiyor.
- `@types/node`, `eslint`, `typescript` latest'e gore geride ama bunlar Next 15 -> 16 gecisi icin zorunlu blocker degil; ayrica major artislari var, ayri bir compat testi gerektirir.
- `node -v` sonucu `v22.22.1`; Next 16 minimum gereksinimi olan Node 20.9+ ustunde.

## Faz 0 Sonucu

Mevcut stack modern ve buyuk olcude guncel. "Upgrade once analiz" perspektifinden asil aksiyon maddesi su:

1. `src/middleware.ts` icin `proxy.ts` gecisi planlanmali.
2. Codemod calistirilsa bile repo genelinde buyuk bir diff beklenmemeli.
3. Tailwind 4 ve ESLint Flat Config tarafinda ek migrasyon ihtiyaci yok.
4. Async Request APIs ve cache semantics acisindan mevcut kod tabaninda acik bir blokaj yok.

## Kaynaklar

- Next.js 16 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js `proxy.js|ts` file convention: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
- Next.js Turbopack config docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
- Next.js caching and revalidating docs: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
