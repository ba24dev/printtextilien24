import {
  filterCollectionsByCustomerTags,
  isProductVisibleForCustomerByCollections,
  normalizeAccessToken,
} from "@/lib/catalog/access";
import { describe, expect, it } from "vitest";

describe("catalog access helpers", () => {
  it("collapses separators and case in normalization", () => {
    expect(normalizeAccessToken(" Fire-fighter ")).toBe("firefighter");
    expect(normalizeAccessToken("TSV")).toBe("tsv");
    expect(normalizeAccessToken("T S V")).toBe("tsv");
  });

  it("filters collections by matching customer tags", () => {
    const collections = [
      { title: "TSV", handle: "tsv" },
      { title: "Fire fighter", handle: "firefighter" },
      { title: "Allgemein", handle: "allgemein" },
    ];

    const visible = filterCollectionsByCustomerTags(collections, ["TSV", "Firefighter"]);
    expect(visible.map((entry) => entry.handle)).toEqual(["tsv", "firefighter", "allgemein"]);
  });

  it("keeps only Allgemein visible for anonymous users", () => {
    const visible = filterCollectionsByCustomerTags(
      [{ title: "TSV" }, { title: "Allgemein" }],
      []
    );
    expect(visible).toEqual([{ title: "Allgemein" }]);
  });

  it("uses any matching collection for product visibility", () => {
    expect(isProductVisibleForCustomerByCollections(["Allgemein", "TSV"], ["tsv"]))
      .toBe(true);
    expect(isProductVisibleForCustomerByCollections(["Allgemein"], []))
      .toBe(true);
    expect(isProductVisibleForCustomerByCollections(["Verein"], ["tsv"]))
      .toBe(false);
    expect(isProductVisibleForCustomerByCollections(undefined, ["tsv"]))
      .toBe(false);
  });
});
