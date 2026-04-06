import { describe, expect, it } from "vitest";
import { scorePriceMatch } from "../price-service";

describe("scorePriceMatch", () => {
  it("returns high confidence for same item, same city, recent record", () => {
    const result = scorePriceMatch({
      boqItem: {
        is_tanimi: "C30 Hazir Beton",
        birim: "m3",
        poz_no: "15.001",
        discipline_name: "Insaat",
      },
      priceRecord: {
        item_name: "C30 Hazir Beton",
        unit: "m3",
        discipline: "Insaat",
        city: "Gaziantep",
        source_date: new Date().toISOString().slice(0, 10),
      },
      preferredCity: "Gaziantep",
    });

    expect(result.confidence).toBe("yuksek");
    expect(result.stale).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  it("returns low confidence for stale partial match", () => {
    const staleDate = new Date();
    staleDate.setMonth(staleDate.getMonth() - 8);

    const result = scorePriceMatch({
      boqItem: {
        is_tanimi: "Elektrik Kablosu",
        birim: "m",
        poz_no: "26.015",
        discipline_name: "Elektrik",
      },
      priceRecord: {
        item_name: "NYY Kablo",
        unit: "m",
        discipline: "Elektrik",
        city: "Ankara",
        source_date: staleDate.toISOString().slice(0, 10),
      },
      preferredCity: "Gaziantep",
    });

    expect(result.confidence).toBe("dusuk");
    expect(result.stale).toBe(true);
  });
});
