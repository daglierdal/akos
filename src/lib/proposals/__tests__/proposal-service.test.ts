import { describe, expect, it } from "vitest";
import {
  computeProposalTotals,
  resolveProposalVatRate,
} from "../proposal-service";

describe("resolveProposalVatRate", () => {
  it("returns reduced VAT for configured material hints", () => {
    expect(
      resolveProposalVatRate({
        discipline: "Mobilya",
        category: "Sabit mobilya",
        description: "Özel üretim furniture imalatı",
      })
    ).toBe(0.1);
  });

  it("falls back to default VAT", () => {
    expect(
      resolveProposalVatRate({
        discipline: "İnşaat",
        category: "Betonarme",
        description: "Kalip ve demir imalati",
      })
    ).toBe(0.2);
  });
});

describe("computeProposalTotals", () => {
  it("applies margin, proposal discount and VAT", () => {
    const result = computeProposalTotals(
      [
        {
          proposalBoqItemId: "pbi-1",
          boqItemId: "boq-1",
          quantity: 10,
          malzemeBf: 100,
          iscilikBf: 50,
          isExcluded: false,
          itemDiscountType: null,
          itemDiscountValue: 0,
          vatRate: 0.2,
          discipline: "İnşaat",
        },
      ],
      {
        marginPercent: 20,
        proposalDiscountType: "percentage",
        proposalDiscountValue: 10,
      }
    );

    expect(result.totals.totalCost).toBe(1500);
    expect(result.totals.marginAmount).toBe(300);
    expect(result.totals.proposalDiscountAmount).toBe(180);
    expect(result.totals.totalPrice).toBe(1620);
    expect(result.totals.totalVat).toBe(324);
    expect(result.totals.grandTotal).toBe(1944);
  });

  it("applies line-level fixed discount before margin and skips excluded rows", () => {
    const result = computeProposalTotals(
      [
        {
          proposalBoqItemId: "pbi-1",
          boqItemId: "boq-1",
          quantity: 2,
          malzemeBf: 200,
          iscilikBf: 100,
          isExcluded: false,
          itemDiscountType: "fixed",
          itemDiscountValue: 50,
          vatRate: 0.1,
          discipline: "Mobilya",
        },
        {
          proposalBoqItemId: "pbi-2",
          boqItemId: "boq-2",
          quantity: 5,
          malzemeBf: 10,
          iscilikBf: 10,
          isExcluded: true,
          itemDiscountType: null,
          itemDiscountValue: 0,
          vatRate: 0.2,
          discipline: "İnşaat",
        },
      ],
      {
        marginPercent: 10,
        proposalDiscountType: "fixed",
        proposalDiscountValue: 40,
      }
    );

    expect(result.lines).toHaveLength(1);
    expect(result.totals.totalCost).toBe(550);
    expect(result.totals.marginAmount).toBe(55);
    expect(result.totals.proposalDiscountAmount).toBe(40);
    expect(result.totals.totalPrice).toBe(565);
    expect(result.totals.totalVat).toBe(56.5);
    expect(result.totals.grandTotal).toBe(621.5);
  });
});
