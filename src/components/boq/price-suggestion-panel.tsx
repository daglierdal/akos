"use client"

import { Check, Sparkles, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface PriceSuggestionItem {
  id: string
  poz_no: string
  is_tanimi: string
  suggestedPrice: number
  currentPrice: number
  confidence: "high" | "medium" | "none"
}

interface PriceSuggestionPanelProps {
  items?: PriceSuggestionItem[]
  onApplyAll?: (items: PriceSuggestionItem[]) => void
  onDecision?: (item: PriceSuggestionItem, decision: "accept" | "reject") => void
}

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
})

export const MOCK_PRICE_SUGGESTIONS: PriceSuggestionItem[] = [
  {
    id: "1",
    poz_no: "M-01",
    is_tanimi: "Alcipan bolme duvar",
    currentPrice: 580,
    suggestedPrice: 595,
    confidence: "high",
  },
  {
    id: "2",
    poz_no: "MK-04",
    is_tanimi: "Yangin sprink sistemi",
    currentPrice: 10150,
    suggestedPrice: 10400,
    confidence: "medium",
  },
  {
    id: "3",
    poz_no: "E-14",
    is_tanimi: "UPS pano besleme",
    currentPrice: 0,
    suggestedPrice: 0,
    confidence: "none",
  },
]

const GROUP_META = {
  high: {
    label: "Yüksek güven",
    badgeClass: "border-green-300 bg-green-100 text-green-900",
    containerClass: "border-green-200/80 bg-green-50/60",
  },
  medium: {
    label: "Orta güven",
    badgeClass: "border-yellow-300 bg-yellow-100 text-yellow-900",
    containerClass: "border-yellow-200/80 bg-yellow-50/60",
  },
  none: {
    label: "Eşleşme yok",
    badgeClass: "border-red-300 bg-red-100 text-red-900",
    containerClass: "border-red-200/80 bg-red-50/60",
  },
}

export function PriceSuggestionPanel({
  items = MOCK_PRICE_SUGGESTIONS,
  onApplyAll,
  onDecision,
}: PriceSuggestionPanelProps) {
  const groups = {
    high: items.filter((item) => item.confidence === "high"),
    medium: items.filter((item) => item.confidence === "medium"),
    none: items.filter((item) => item.confidence === "none"),
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>AI Fiyat Önerileri</CardTitle>
            <CardDescription>
              Sonuçlar placeholder veriyle listeleniyor. Kabul/red aksiyonları backend bağlanınca kalıcı olacak.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => onApplyAll?.(items)}>
            Toplu uygula
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groups).map(([key, groupItems]) => {
          const meta = GROUP_META[key as keyof typeof GROUP_META]

          return (
            <div key={key} className={`rounded-xl border p-3 ${meta.containerClass}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">{meta.label}</span>
                </div>
                <Badge variant="outline" className={meta.badgeClass}>
                  {groupItems.length} kalem
                </Badge>
              </div>

              <div className="space-y-2">
                {groupItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Bu grupta kalem yok.</p>
                ) : null}

                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/70 bg-background/90 p-3 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium">
                          {item.poz_no} · {item.is_tanimi}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Mevcut: {currencyFormatter.format(item.currentPrice)} | Öneri:{" "}
                          {currencyFormatter.format(item.suggestedPrice)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDecision?.(item, "accept")}
                        >
                          <Check className="h-4 w-4" />
                          Kabul
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDecision?.(item, "reject")}
                        >
                          <X className="h-4 w-4" />
                          Red
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
