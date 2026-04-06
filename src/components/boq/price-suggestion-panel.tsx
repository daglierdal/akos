"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, RefreshCw, Sparkles, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface PriceSuggestionItem {
  id: string
  boqItemId: string
  poz_no: string
  is_tanimi: string
  currentMalzemeBf: number
  currentIscilikBf: number
  currentTotalPrice: number
  suggestedMalzemeBf: number
  suggestedIscilikBf: number
  suggestedTotalPrice: number
  confidence: "high" | "medium" | "low" | "none"
  warnings: string[]
}

interface PriceSuggestionPanelProps {
  projectId?: string | null
}

interface SuggestionsResponse {
  proposalId: string
  revisionNo: number
  suggestions: PriceSuggestionItem[]
}

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
})

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
  low: {
    label: "Düşük güven",
    badgeClass: "border-orange-300 bg-orange-100 text-orange-900",
    containerClass: "border-orange-200/80 bg-orange-50/60",
  },
  none: {
    label: "Eşleşme yok",
    badgeClass: "border-red-300 bg-red-100 text-red-900",
    containerClass: "border-red-200/80 bg-red-50/60",
  },
} as const

export function PriceSuggestionPanel({ projectId = null }: PriceSuggestionPanelProps) {
  const [items, setItems] = useState<PriceSuggestionItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  async function loadSuggestions() {
    if (!projectId) {
      setItems([])
      setError(null)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/boq/suggest-prices?${new URLSearchParams({ projectId }).toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      const payload = (await response.json()) as SuggestionsResponse & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Fiyat önerileri alınamadı.")
      }

      setItems(payload.suggestions)
      setError(null)
    } catch (requestError) {
      setItems([])
      setError(
        requestError instanceof Error ? requestError.message : "Fiyat önerileri alınamadı."
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSuggestions()
  }, [projectId])

  async function handleDecision(item: PriceSuggestionItem, decision: "accept" | "reject") {
    if (!projectId) {
      return
    }

    setActiveItemId(item.id)

    try {
      const response = await fetch("/api/boq/suggest-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          boqItemId: item.boqItemId,
          decision,
        }),
      })

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Fiyat kararı kaydedilemedi.")
      }

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                currentMalzemeBf:
                  decision === "accept"
                    ? currentItem.suggestedMalzemeBf
                    : currentItem.currentMalzemeBf,
                currentIscilikBf:
                  decision === "accept"
                    ? currentItem.suggestedIscilikBf
                    : currentItem.currentIscilikBf,
                currentTotalPrice:
                  decision === "accept"
                    ? currentItem.suggestedTotalPrice
                    : currentItem.currentTotalPrice,
              }
            : currentItem
        )
      )
      setError(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Fiyat kararı kaydedilemedi."
      )
    } finally {
      setActiveItemId(null)
    }
  }

  const groups = {
    high: items.filter((item) => item.confidence === "high"),
    medium: items.filter((item) => item.confidence === "medium"),
    low: items.filter((item) => item.confidence === "low"),
    none: items.filter((item) => item.confidence === "none"),
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>AI Fiyat Önerileri</CardTitle>
            <CardDescription>
              Sonuçlar gerçek fiyat eşleştirme servisiyle yüklenir ve kabul/red aksiyonları
              `proposal_boq_items` tablosuna yazılır.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => void loadSuggestions()} disabled={isLoading || !projectId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Yenile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!projectId ? (
          <p className="text-sm text-muted-foreground">Fiyat önerileri için aktif bir proje seçin.</p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fiyat önerileri yükleniyor.
          </div>
        ) : null}

        {!isLoading && projectId && items.length === 0 && !error ? (
          <p className="text-sm text-muted-foreground">Öneri bulunamadı.</p>
        ) : null}

        {!isLoading
          ? (Object.entries(groups) as Array<[keyof typeof groups, PriceSuggestionItem[]]>).map(
              ([key, groupItems]) => {
                const meta = GROUP_META[key]

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

                      {groupItems.map((item) => {
                        const isBusy = activeItemId === item.id

                        return (
                          <div
                            key={item.id}
                            className="rounded-lg border border-white/70 bg-background/90 p-3 shadow-sm"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {item.poz_no} · {item.is_tanimi}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Mevcut: {currencyFormatter.format(item.currentTotalPrice)} | Öneri:{" "}
                                  {currencyFormatter.format(item.suggestedTotalPrice)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Malzeme {currencyFormatter.format(item.currentMalzemeBf)} →{" "}
                                  {currencyFormatter.format(item.suggestedMalzemeBf)} | İşçilik{" "}
                                  {currencyFormatter.format(item.currentIscilikBf)} →{" "}
                                  {currencyFormatter.format(item.suggestedIscilikBf)}
                                </p>
                                {item.warnings.length > 0 ? (
                                  <p className="text-xs text-muted-foreground">
                                    {item.warnings.join(" · ")}
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void handleDecision(item, "accept")}
                                  disabled={isBusy}
                                >
                                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                  Kabul
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => void handleDecision(item, "reject")}
                                  disabled={isBusy}
                                >
                                  <X className="h-4 w-4" />
                                  Red
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }
            )
          : null}
      </CardContent>
    </Card>
  )
}
