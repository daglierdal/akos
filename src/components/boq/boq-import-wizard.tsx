"use client"

import { useState, type DragEvent } from "react"
import { CheckCircle2, FileSpreadsheet, Loader2, TriangleAlert, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ImportStep = 1 | 2 | 3

interface ImportResult {
  jobId: string
  rowCount: number
  importedCount: number
  errorCount: number
  warningCount: number
}

interface BoqImportWizardProps {
  projectId?: string | null
  onImport?: (payload: ImportResult) => void
}

export function BoqImportWizard({ projectId = null, onImport }: BoqImportWizardProps) {
  const [step, setStep] = useState<ImportStep>(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  function resetState(file: File | null) {
    setSelectedFile(file)
    setResult(null)
    setError(null)
    setStep(file ? 2 : 1)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files[0] ?? null
    resetState(file)
  }

  function handleFile(file: File | null) {
    resetState(file)
  }

  async function handleImport() {
    if (!selectedFile || !projectId) {
      return
    }

    const formData = new FormData()
    formData.append("projectId", projectId)
    formData.append("file", selectedFile)

    setIsImporting(true)
    setError(null)

    try {
      const response = await fetch("/api/boq/import", {
        method: "POST",
        body: formData,
      })

      const payload = (await response.json()) as ImportResult & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "BOQ import başarısız oldu.")
      }

      setResult(payload)
      onImport?.(payload)
      setStep(3)
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "BOQ import başarısız oldu."
      )
    } finally {
      setIsImporting(false)
    }
  }

  const hasUnsupportedExtension =
    selectedFile !== null && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)

  return (
    <Card>
      <CardHeader>
        <CardTitle>BOQ Import Wizard</CardTitle>
        <CardDescription>
          Mock önizleme kaldırıldı. Dosya doğrudan backend import servisine gönderilir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((item) => (
            <Badge
              key={item}
              variant={item === step ? "default" : "outline"}
              className="h-7 rounded-full px-3"
            >
              Adım {item}
            </Badge>
          ))}
        </div>

        {step === 1 ? (
          <div
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center"
          >
            <UploadCloud className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Step 1: Dosya seç</p>
            <p className="mt-1 text-sm text-muted-foreground">
              XLSX, XLS veya CSV dosyasını sürükleyip bırakın.
            </p>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="mx-auto mt-4 max-w-sm"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{selectedFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  Dosya backend import servisine gönderilmeye hazır.
                </p>
              </div>
            </div>

            {!projectId ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-100/70 p-3 text-red-900">
                <TriangleAlert className="h-4 w-4" />
                Import için aktif bir proje seçilmelidir.
              </div>
            ) : null}

            {hasUnsupportedExtension ? (
              <div className="flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-100/70 p-3 text-yellow-900">
                <TriangleAlert className="h-4 w-4" />
                Dosya uzantısı beklenen format dışında görünüyor.
              </div>
            ) : null}

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-100/70 p-3 text-red-900">
                <TriangleAlert className="h-4 w-4" />
                {error}
              </div>
            ) : null}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => resetState(null)}>
                Dosyayı temizle
              </Button>
              <Button
                onClick={() => void handleImport()}
                disabled={!projectId || hasUnsupportedExtension || isImporting}
              >
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Import et
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 && result ? (
          <div
            className={cn(
              "space-y-3 rounded-xl border border-green-300 bg-green-100/70 p-4 text-green-950"
            )}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <p className="font-medium">BOQ import tamamlandı</p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>Job ID: {result.jobId}</p>
              <p>Toplam satır: {result.rowCount}</p>
              <p>Aktarılan satır: {result.importedCount}</p>
              <p>Uyarı: {result.warningCount}</p>
              <p>Hata: {result.errorCount}</p>
            </div>
            <Button variant="outline" onClick={() => resetState(null)}>
              Yeni dosya seç
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
