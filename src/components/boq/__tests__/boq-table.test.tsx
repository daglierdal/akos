import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { BoqTable, MOCK_BOQ_ROWS } from "@/components/boq/boq-table"

describe("BoqTable", () => {
  it("renders grouped rows and totals", () => {
    render(<BoqTable rows={MOCK_BOQ_ROWS} />)

    expect(screen.getByText("BOQ Kalemleri")).toBeInTheDocument()
    expect(screen.getAllByText("Mimari").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Mekanik").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Elektrik").length).toBeGreaterThan(0)
    expect(screen.getByText("Genel Toplam")).toBeInTheDocument()
    expect(screen.getByText("Alcipan bolme duvar")).toBeInTheDocument()
  })
})
