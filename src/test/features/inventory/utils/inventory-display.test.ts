import { describe, expect, it } from "vitest";
import { getStockLevelLabel } from "@/features/inventory/utils/inventory-display";

describe("inventory display helpers", () => {
  it("trusts backend stock flags instead of recalculating thresholds", () => {
    expect(getStockLevelLabel({ isOutOfStock: false, isLowStock: true })).toBe("Low Stock");
    expect(getStockLevelLabel({ isOutOfStock: true, isLowStock: true })).toBe("Out of Stock");
  });
});
