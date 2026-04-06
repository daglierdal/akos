"use client"

import { useMemo, useState, type DragEvent } from "react"
import { CheckCircle2, FileSpreadsheet, TriangleAlert, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const REQUIRED_FIELDS = [
  "poz_no",
  "is_tanimi",
  "birim",
  "miktar",
  "malzeme_bf",
  "iscilik_bf",
]

type ImportStep = 1 | 2 | 3 | 4

interface PreviewRow {
  [key: string]: string | number
}

const MOCK_PREVIEW_ROWS: PreviewRow[] = [
  {
    poz: "M-01",
    tanim: "Alcipan bolme duvar",
    birim: "m2",
    qty: 240,
    malzeme: 420,
    iscilik: 160,
    disiplin: "Mimari",
  },
  {
    poz: "MK-04",
    tanim: "Yangin sprink sistemi",
    birim: "set",
    qty: 12,
    malzeme: 8400,
    iscilik: 1750,
    disiplin: "Mekanik",
  },
]

interface BoqImportWizardProps {
  onImport?: (payload: {
    fileName: string
    mapping: Record<string, string>
    previewRows: PreviewRow[]
  }) => void
}

export function BoqImportWizard({ onImport }: BoqImportWizardProps) {
  const [step, setStep] = useState<ImportStep>(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewRows] = useState<PreviewRow[]>(MOCK_PREVIEW_ROWS)
  const [mapping, setMapping] = useState<Record<string, string>>({
    poz_no: "poz",
    is_tanimi: "tanim",
    birim: "birim",
    miktar: "qty",
    malzeme_bf: "malzeme",
    iscilik_bf: "iscilik",
  })

  const previewColumns = useMemo(
    () => Object.keys(previewRows[0] ?? {}).slice(0, 10),
    [previewRows]
  )

  const validationResults = useMemo(() => {
    const warnings = []
    const errors = []

    for (const field of REQUIRED_FIELDS) {
      if (!mapping[field]) {
        errors.push(`${field} için kolon eşlemesi eksik.`)
      }
    }

    if (selectedFile && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      warnings.push("Dosya uzantısı beklenen format dışında. Backend entegrasyonunda doğrulama sıkılaşacak.")
    }

    if (previewRows.some((row) => Number(row.qty ?? 0) <= 0)) {
      warnings.push("Miktarı sıfır veya negatif görünen satırlar var.")
    }

    return { errors, warnings }
  }, [mapping, previewRows, selectedFile])

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (!file) {
      return
    }

    setSelectedFile(file)
    setStep(2)
  }

  function handleFile(file: File | null) {
    if (!file) {
      return
    }

    setSelectedFile(file)
    setStep(2)
  }

  function handleImport() {
    if (!selectedFile) {
      return
    }

    onImport?.({
      fileName: selectedFile.name,
      mapping,
      previewRows,
    })
    setStep(4)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>BOQ Import Wizard</CardTitle>
        <CardDescription>
          Backend hazır olana kadar önizleme ve doğrulama mock veriyle çalışır.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((item) => (
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
                <p className="font-medium">{selectedFile?.name ?? "mock-boq.xlsx"}</p>
                <p className="text-xs text-muted-foreground">Step 2: Önizleme ve kolon eşleme</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {REQUIRED_FIELDS.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{field}</Label>
                  <select
                    id={field}
                    value={mapping[field] ?? ""}
                    onChange={(event) =>
                      setMapping((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                  >
                    <option value="">Kolon seç</option>
                    {previewColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewColumns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {previewColumns.map((column) => (
                        <TableCell key={`${index}-${column}`}>{String(row[column] ?? "")}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(3)}>Doğrulamaya geç</Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <p className="font-medium">Step 3: Doğrulama sonuçları</p>
            <div className="space-y-3">
              {validationResults.errors.length === 0 && validationResults.warnings.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-100/70 p-3 text-green-900">
                  <CheckCircle2 className="h-4 w-4" />
                  Hata veya uyarı bulunmadı.
                </div>
              ) : null}

              {validationResults.errors.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-100/70 p-3 text-red-900"
                >
                  <TriangleAlert className="h-4 w-4" />
                  {item}
                </div>
              ))}

              {validationResults.warnings.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-100/70 p-3 text-yellow-900"
                >
                  <TriangleAlert className="h-4 w-4" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Geri
              </Button>
              <Button
                onClick={handleImport}
                disabled={validationResults.errors.length > 0}
              >
                Onayla ve import et
              </Button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div
            className={cn(
              "rounded-xl border border-green-300 bg-green-100/70 p-4 text-green-950"
            )}
          >
            <p className="font-medium">Step 4: İçe aktarma onaylandı</p>
            <p className="mt-1 text-sm">
              {selectedFile?.name ?? "mock-boq.xlsx"} kuyruğa alındı. P5a merge sonrası gerçek API çağrısı bağlanacak.
            </p>
          </div>
        ) : null}

        {step > 1 && step < 4 ? (
          <div className="flex justify-start">
            <Button variant="ghost" onClick={() => setStep((step - 1) as ImportStep)}>
              Önceki adım
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
