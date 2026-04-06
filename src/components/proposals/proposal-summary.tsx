"use client";

import { useEffect, useState } from "react";
import { Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProposalSummaryResponse {
  proposal: {
    id: string;
    revision_code: string;
    status: string;
  };
  totals: {
    totalCost: number;
    marginPercent: number;
    marginAmount: number;
    proposalDiscountAmount: number;
    totalPrice: number;
    totalVat: number;
    grandTotal: number;
  };
  disciplineSummary: Array<{
    discipline: string;
    cost: number;
    price: number;
    vat: number;
    total: number;
  }>;
}

interface ProposalSummaryProps {
  projectId?: string | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProposalSummary({ projectId }: ProposalSummaryProps) {
  const [summary, setSummary] = useState<ProposalSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    if (projectId === null) {
      setSummary(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const searchParams = new URLSearchParams();

      if (projectId) {
        searchParams.set("projectId", projectId);
      }

      const url = searchParams.size > 0
        ? `/api/proposals/summary?${searchParams.toString()}`
        : "/api/proposals/summary";

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 404) {
        setSummary(null);
        setError(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Teklif ozeti yuklenemedi.");
      }

      const payload = (await response.json()) as ProposalSummaryResponse;
      setSummary(payload);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Teklif ozeti yuklenemedi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, [projectId]);

  async function handleGeneratePdf() {
    if (!summary) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const response = await fetch(`/api/proposals/${summary.proposal.id}/pdf`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("PDF olusturulamadi.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${summary.proposal.revision_code}_proposal.pdf`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "PDF olusturulamadi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  async function handleSubmit() {
    if (!summary) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/proposals/${summary.proposal.id}/submit`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Teklif submit edilemedi.");
      }

      await loadSummary();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Teklif submit edilemedi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Teklif Özeti</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Teklif verileri yükleniyor.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Teklif Özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Henüz teklif bulunmuyor.</p>
            {projectId === null ? <p>Aktif bir proje secilmedi.</p> : null}
            {error ? <p className="text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Teklif Özeti</CardTitle>
          <p className="text-sm text-muted-foreground">
            {summary.proposal.revision_code} / {summary.proposal.status}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {summary.disciplineSummary.map((row) => (
              <div
                key={row.discipline}
                className="grid grid-cols-[1.5fr_1fr] items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium">{row.discipline}</span>
                <span className="text-right text-muted-foreground">
                  {formatCurrency(row.cost)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Maliyet</span>
              <span>{formatCurrency(summary.totals.totalCost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Marj (%{summary.totals.marginPercent})
              </span>
              <span>{formatCurrency(summary.totals.marginAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">İndirim</span>
              <span>{formatCurrency(summary.totals.proposalDiscountAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">KDV</span>
              <span>{formatCurrency(summary.totals.totalVat)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 font-medium">
              <span>Genel Toplam</span>
              <span>{formatCurrency(summary.totals.grandTotal)}</span>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf || isSubmitting}>
              <Download className="mr-2 h-4 w-4" />
              PDF Oluştur
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isGeneratingPdf}>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
