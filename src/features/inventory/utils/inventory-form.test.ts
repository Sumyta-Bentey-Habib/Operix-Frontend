import { describe, expect, it } from "vitest";
import type { InventoryItem } from "../types/inventory.types";
import {
  buildCreateCategoryPayload,
  buildCreateItemPayload,
  buildUpdateCategoryPayload,
  buildUpdateItemPayload,
} from "./inventory-form";

const item: InventoryItem = {
  id: "item-1",
  sku: "LAP-001",
  name: "Laptop",
  description: "Old",
  team: { id: "team-1", name: "Team A" },
  category: { id: "cat-inactive", name: "Equipment" },
  quantity: 10,
  lowStockThreshold: 5,
  isLowStock: false,
  isOutOfStock: false,
  isReturnable: false,
  isActive: true,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

describe("inventory form helpers", () => {
  it("omits blank Category create description and clears update description with null", () => {
    expect(buildCreateCategoryPayload({ name: " Equipment ", description: " " })).toEqual({
      name: "Equipment",
    });

    expect(
      buildUpdateCategoryPayload(
        {
          id: "cat-1",
          name: "Equipment",
          description: "Old",
          isActive: true,
          createdAt: "",
          updatedAt: "",
        },
        { name: "Equipment", description: "", isActive: false },
      ),
    ).toEqual({
      description: null,
      isActive: false,
    });
  });

  it("keeps openingQuantity in create and never needs a second Stock In command", () => {
    expect(
      buildCreateItemPayload({
        teamId: "team-1",
        sku: " LAP-001 ",
        name: " Laptop ",
        description: "",
        categoryId: "",
        openingQuantity: "10",
        lowStockThreshold: "",
        isReturnable: true,
        isActive: true,
      }),
    ).toEqual({
      teamId: "team-1",
      sku: "LAP-001",
      name: "Laptop",
      openingQuantity: 10,
      lowStockThreshold: null,
      isReturnable: true,
    });
  });

  it("builds Item update dirty diffs without SKU, Team, quantity, or openingQuantity", () => {
    const payload = buildUpdateItemPayload(item, {
      teamId: "team-changed",
      sku: "SKU-CHANGED",
      name: "Laptop",
      description: "",
      categoryId: "cat-inactive",
      openingQuantity: "99",
      lowStockThreshold: "",
      isReturnable: false,
      isActive: true,
    });

    expect(payload).toEqual({
      description: null,
      lowStockThreshold: null,
    });
    expect(payload).not.toHaveProperty("sku");
    expect(payload).not.toHaveProperty("teamId");
    expect(payload).not.toHaveProperty("quantity");
    expect(payload).not.toHaveProperty("openingQuantity");
    expect(payload).not.toHaveProperty("categoryId");
  });
});
