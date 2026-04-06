"use client"

import { Fragment, useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type BoqValidationStatus = "ok" | "warning"

export interface BoqTableRow {
  id: string
  discipline: string
  poz_no: string
  is_tanimi: string
  birim: string
  miktar: number
  malzeme_bf: number
  iscilik_bf: number
  toplam_bf: number
  tutar: number
  validation_status?: BoqValidationStatus
  aiSuggestedFields?: Partial<
    Record<
      "malzeme_bf" | "iscilik_bf" | "toplam_bf" | "tutar",
      number
    >
  >
}

interface BoqTableProps {
  rows?: BoqTableRow[]
  onRowsChange?: (rows: BoqTableRow[]) => void
}

type EditableField =
  | "poz_no"
  | "is_tanimi"
  | "birim"
  | "miktar"
  | "malzeme_bf"
  | "iscilik_bf"

type BoqColumnKey =
  | "poz_no"
  | "is_tanimi"
  | "birim"
  | "miktar"
  | "malzeme_bf"
  | "iscilik_bf"
  | "toplam_bf"
  | "tutar"

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 2,
})

export const MOCK_BOQ_ROWS: BoqTableRow[] = [
  {
    id: "1",
    discipline: "Mimari",
    poz_no: "M-01",
    is_tanimi: "Alcipan bolme duvar",
    birim: "m2",
    miktar: 240,
    malzeme_bf: 420,
    iscilik_bf: 160,
    toplam_bf: 580,
    tutar: 139200,
    aiSuggestedFields: { malzeme_bf: 435, toplam_bf: 595 },
  },
  {
    id: "2",
    discipline: "Mimari",
    poz_no: "M-02",
    is_tanimi: "Seramik duvar kaplama",
    birim: "m2",
    miktar: 180,
    malzeme_bf: 510,
    iscilik_bf: 210,
    toplam_bf: 720,
    tutar: 129600,
    validation_status: "warning",
  },
  {
    id: "3",
    discipline: "Mekanik",
    poz_no: "MK-04",
    is_tanimi: "Yangin sprink sistemi",
    birim: "set",
    miktar: 12,
    malzeme_bf: 8400,
    iscilik_bf: 1750,
    toplam_bf: 10150,
    tutar: 121800,
    aiSuggestedFields: { iscilik_bf: 1850 },
  },
  {
    id: "4",
    discipline: "Elektrik",
    poz_no: "E-11",
    is_tanimi: "Aydinlatma armaturlari",
    birim: "adet",
    miktar: 96,
    malzeme_bf: 2100,
    iscilik_bf: 320,
    toplam_bf: 2420,
    tutar: 232320,
  },
]

function formatCellValue(value: string | number, numeric?: boolean) {
  if (typeof value === "number") {
    return numeric ? numberFormatter.format(value) : currencyFormatter.format(value)
  }

  return value
}

function toEditableValue(value: string | number) {
  return typeof value === "number" ? String(value) : value
}

function normalizeEditedRow(row: BoqTableRow, field: EditableField, value: string) {
  const nextRow = { ...row }

  if (field === "poz_no" || field === "is_tanimi" || field === "birim") {
    nextRow[field] = value
    return nextRow
  }

  const parsed = Number(value.replace(",", "."))
  nextRow[field] = Number.isFinite(parsed) ? parsed : 0
  nextRow.toplam_bf = Number((nextRow.malzeme_bf + nextRow.iscilik_bf).toFixed(2))
  nextRow.tutar = Number((nextRow.miktar * nextRow.toplam_bf).toFixed(2))
  return nextRow
}

export function BoqTable({
  rows = MOCK_BOQ_ROWS,
  onRowsChange,
}: BoqTableProps) {
  const [data, setData] = useState(rows)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "poz_no", desc: false },
  ])
  const [globalFilter, setGlobalFilter] = useState("")
  const [collapsedDisciplines, setCollapsedDisciplines] = useState<Record<string, boolean>>({})
  const [editingCell, setEditingCell] = useState<{
    rowId: string
    field: EditableField
  } | null>(null)
  const [draftValue, setDraftValue] = useState("")

  const columns = useMemo<ColumnDef<BoqTableRow>[]>(
    () => [
      { accessorKey: "poz_no", header: "Poz No" },
      { accessorKey: "is_tanimi", header: "İş Tanımı" },
      { accessorKey: "birim", header: "Birim" },
      { accessorKey: "miktar", header: "Miktar" },
      { accessorKey: "malzeme_bf", header: "Malzeme BF" },
      { accessorKey: "iscilik_bf", header: "İşçilik BF" },
      { accessorKey: "toplam_bf", header: "Toplam BF" },
      { accessorKey: "tutar", header: "Tutar" },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const haystack = [
        row.original.discipline,
        row.original.poz_no,
        row.original.is_tanimi,
        row.original.birim,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR")

      return haystack.includes(String(filterValue).toLocaleLowerCase("tr-TR"))
    },
  })

  const visibleRows = table.getRowModel().rows.map((row) => row.original)
  const groupedRows = visibleRows.reduce<Record<string, BoqTableRow[]>>((acc, row) => {
    acc[row.discipline] ??= []
    acc[row.discipline].push(row)
    return acc
  }, {})

  const grandTotal = visibleRows.reduce((sum, row) => sum + row.tutar, 0)

  function updateRows(nextRows: BoqTableRow[]) {
    setData(nextRows)
    onRowsChange?.(nextRows)
  }

  function beginEdit(row: BoqTableRow, field: EditableField) {
    setEditingCell({ rowId: row.id, field })
    setDraftValue(toEditableValue(row[field]))
  }

  function commitEdit() {
    if (!editingCell) {
      return
    }

    const nextRows = data.map((row) =>
      row.id === editingCell.rowId
        ? normalizeEditedRow(row, editingCell.field, draftValue)
        : row
    )

    updateRows(nextRows)
    setEditingCell(null)
    setDraftValue("")
  }

  function toggleDiscipline(discipline: string) {
    setCollapsedDisciplines((current) => ({
      ...current,
      [discipline]: !current[discipline],
    }))
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>BOQ Kalemleri</CardTitle>
        <CardDescription>
          Disiplin bazlı gruplanmış, filtrelenebilir ve satır içi düzenlenebilir keşif özeti.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Poz no, iş tanımı veya disiplin ara..."
            className="md:max-w-sm"
            aria-label="BOQ filtre"
          />
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1 border-yellow-300 bg-yellow-100/70 text-yellow-900">
              <Sparkles className="h-3 w-3" />
              AI önerisi olan hücre
            </Badge>
            <Badge variant="outline" className="gap-1 border-red-300 bg-red-100/70 text-red-900">
              <AlertTriangle className="h-3 w-3" />
              Uyarılı kalem
            </Badge>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[180px]">Disiplin / Satır</TableHead>
                {table.getFlatHeaders().map((header) => (
                  <TableHead key={header.id}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedRows).map(([discipline, disciplineRows]) => {
                const isCollapsed = collapsedDisciplines[discipline] ?? false
                const subtotal = disciplineRows.reduce((sum, row) => sum + row.tutar, 0)

                return (
                  <Fragment key={discipline}>
                    <TableRow key={`${discipline}-group`} className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={9} className="p-0">
                        <button
                          type="button"
                          onClick={() => toggleDiscipline(discipline)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left"
                        >
                          <span className="inline-flex items-center gap-2 font-medium">
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            {discipline}
                            <Badge variant="secondary">{disciplineRows.length} kalem</Badge>
                          </span>
                          <span className="text-sm font-medium">
                            Alt toplam: {currencyFormatter.format(subtotal)}
                          </span>
                        </button>
                      </TableCell>
                    </TableRow>

                    {!isCollapsed
                      ? disciplineRows.map((row) => (
                          <TableRow
                            key={row.id}
                            className={cn(
                              row.validation_status === "warning" &&
                                "bg-red-100/50 hover:bg-red-100/60"
                            )}
                          >
                            <TableCell className="text-xs text-muted-foreground">
                              {discipline}
                            </TableCell>
                            {table.getFlatHeaders().map((header) => {
                              const field = header.id as BoqColumnKey
                              const value = row[field]
                              const isEditable =
                                field === "poz_no" ||
                                field === "is_tanimi" ||
                                field === "birim" ||
                                field === "miktar" ||
                                field === "malzeme_bf" ||
                                field === "iscilik_bf"
                              const isEditing =
                                editingCell?.rowId === row.id &&
                                editingCell.field === field
                              const hasAiSuggestion = Boolean(
                                field === "malzeme_bf" ||
                                  field === "iscilik_bf" ||
                                  field === "toplam_bf" ||
                                  field === "tutar"
                                  ? row.aiSuggestedFields?.[field]
                                  : undefined
                              )
                              const isCurrencyField =
                                field === "malzeme_bf" ||
                                field === "iscilik_bf" ||
                                field === "toplam_bf" ||
                                field === "tutar"

                              return (
                                <TableCell
                                  key={`${row.id}-${header.id}`}
                                  className={cn(
                                    hasAiSuggestion &&
                                      "bg-yellow-100/70 ring-1 ring-inset ring-yellow-300"
                                  )}
                                >
                                  {isEditing && isEditable ? (
                                    <Input
                                      autoFocus
                                      value={draftValue}
                                      onChange={(event) => setDraftValue(event.target.value)}
                                      onBlur={commitEdit}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                          commitEdit()
                                        }

                                        if (event.key === "Escape") {
                                          setEditingCell(null)
                                        }
                                      }}
                                      aria-label={`${row.poz_no}-${field}`}
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={!isEditable}
                                      onClick={() =>
                                        isEditable
                                          ? beginEdit(row, field as EditableField)
                                          : undefined
                                      }
                                      className={cn(
                                        "w-full text-left",
                                        isEditable && "cursor-text rounded-md px-1 py-1 hover:bg-muted"
                                      )}
                                    >
                                      {typeof value === "number"
                                        ? formatCellValue(value, !isCurrencyField)
                                        : value}
                                    </button>
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))
                      : null}
                  </Fragment>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">Genel Toplam</TableCell>
                <TableCell colSpan={7} />
                <TableCell className="font-semibold">
                  {currencyFormatter.format(grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
