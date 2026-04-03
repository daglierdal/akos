# AkOs - AI-First Proje Yonetim Sistemi

## Felsefe: AI-First

AkOs, geleneksel CRUD arayuzleri yerine **AI-first** yaklasimini benimser.
Kullanici, form doldurmak veya tablo filtrelemek yerine dogal dilde konusarak
is yapar. Sistem, kullanicinin niyetini anlar ve arka planda gerekli
islemleri yurutur.

**Temel ilkeler:**

- **Chat-first mimari**: Her is akisi bir sohbet ile baslar. Kullanici
  "Yeni proje olustur: Konut A Blok, butce 5M TL" dediginde sistem
  gerekli kaydi yaratir.
- **Tool-driven execution**: AI, kullanici niyetini yapilandirilmis tool
  cagrilarina donusturur. Her tool, tek bir is birimini temsil eder.
- **Progressive disclosure**: Basit isler sohbetle, karmasik isler
  detay panelleriyle yapilir. Kullanici asla gereksiz karmasiklikla
  karsilasmaz.

## Mimari

```
src/
├── app/                    # Next.js 15 App Router sayfalari
│   ├── (auth)/             # Giris/kayit sayfalari
│   └── (dashboard)/        # Ana uygulama sayfalari
├── components/             # React bilesenleri
│   └── ui/                 # shadcn/ui temel bilesenleri
├── lib/
│   ├── ai/
│   │   └── tools/          # AI tool tanimlari
│   │       ├── index.ts    # Tool registry ve tipleri
│   │       ├── createProject.ts
│   │       └── getDashboard.ts
│   ├── supabase/           # Supabase client/server
│   └── utils.ts            # Yardimci fonksiyonlar
└── hooks/                  # React hook'lari
```

## AI Tool Sistemi

AI tool'lari `src/lib/ai/tools/` altinda tanimlanir. Her tool:

1. **Zod schema** ile girdi dogrulamasi yapar
2. **execute** fonksiyonu ile islemi yurutur
3. **Tip-guvenli** donusu saglar

### Tool Tanimlama Sablonu

```typescript
import { z } from "zod";
import { defineTool } from "./index";

export const myTool = defineTool({
  name: "myTool",
  description: "Tool aciklamasi",
  parameters: z.object({
    param1: z.string().describe("Parametre aciklamasi"),
  }),
  execute: async (params) => {
    // Is mantigi
    return { success: true, data: ... };
  },
});
```

### Mevcut Tool'lar

| Tool | Amac |
|------|------|
| `createProject` | Yeni proje olusturur (isim, musteri, butce) |
| `getDashboard` | Dashboard ozet verisini getirir |

## Gelistirme

```bash
npm run dev          # Gelistirme sunucusu
npm run build        # Uretim derlemesi
npm run lint         # ESLint kontrolu
npm run test         # Vitest testleri
npm run test:ci      # CI icin tek seferlik test
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Dil**: TypeScript (strict mode)
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Veritabani**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (SSR)
- **Test**: Vitest
- **Lint**: ESLint 9 (flat config)
