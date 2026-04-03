"use client";

import { FileText, BarChart3, ClipboardList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ResultPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResultPanel({ isOpen, onClose }: ResultPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="text-sm font-semibold">Sonuçlar</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Proje Özeti</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Örnek
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Aktif proje sayısı: 12
            </p>
            <p className="text-xs text-muted-foreground">
              Tamamlanan: 8 | Devam eden: 4
            </p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Maliyet Analizi</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Örnek
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam bütçe: ₺2.450.000
            </p>
            <p className="text-xs text-muted-foreground">
              Harcanan: ₺1.870.000 (%76)
            </p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Son Hakediş</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Örnek
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Hakediş #5 — ₺340.000
            </p>
            <p className="text-xs text-muted-foreground">Durum: Onay bekliyor</p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Bu panel ileride AI yanıtlarına bağlı sonuçları gösterecektir.
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
