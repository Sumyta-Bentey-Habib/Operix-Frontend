import { afterEach, describe, expect, it, vi } from "vitest";
import { inventoryAssignmentApi } from "@/features/inventory/api/inventory-assignment.api";
import { inventoryCategoryApi } from "@/features/inventory/api/inventory-category.api";
import { inventoryItemApi } from "@/features/inventory/api/inventory-item.api";
import { inventoryStockApi } from "@/features/inventory/api/inventory-stock.api";
import { inventorySummaryApi } from "@/features/inventory/api/inventory-summary.api";
import { inventoryTransactionApi } from "@/features/inventory/api/inventory-transaction.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("inventory APIs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses exact Category endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => Promise.resolve(jsonResponse({})));

    await inventoryCategoryApi.list({ page: 1, limit: 20 });
    await inventoryCategoryApi.getById("cat-1");
    await inventoryCategoryApi.create({ name: "Equipment" });
    await inventoryCategoryApi.update("cat-1", { description: null, isActive: false });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/categories?page=1&limit=20",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/categories/cat-1",
    );
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/categories",
    );
    expect(String(fetchMock.mock.calls[3]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/categories/cat-1",
    );
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).method).toBe("POST");
    expect((fetchMock.mock.calls[3]?.[1] as RequestInit).method).toBe("PATCH");
  });

  it("uses exact Item endpoints and query fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => Promise.resolve(jsonResponse({})));

    await inventoryItemApi.list({
      page: 2,
      limit: 20,
      q: "lap",
      categoryId: "cat-1",
      teamId: "team-1",
      isActive: true,
      isReturnable: false,
      lowStock: true,
    });
    await inventoryItemApi.create({
      teamId: "team-1",
      sku: "LAP-001",
      name: "Laptop",
      openingQuantity: 10,
    });
    await inventoryItemApi.update("item-1", { name: "Laptop 2", categoryId: null });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/items?page=2&limit=20&q=lap&categoryId=cat-1&teamId=team-1&isActive=true&isReturnable=false&lowStock=true",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/items",
    );
    expect(JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body))).toEqual({
      teamId: "team-1",
      sku: "LAP-001",
      name: "Laptop",
      openingQuantity: 10,
    });
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/items/item-1",
    );
    expect(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body)).not.toContain("quantity");
  });

  it("uses exact stock command endpoints and adjustment directions", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => Promise.resolve(jsonResponse({})));

    await inventoryStockApi.stockIn("item-1", { quantity: 5 });
    await inventoryStockApi.stockOut("item-1", { quantity: 1, reason: "Issued" });
    await inventoryStockApi.adjust("item-1", {
      direction: "INCREASE",
      quantity: 2,
      reason: "Count correction",
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/items/item-1/stock-in",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/items/item-1/stock-out",
    );
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/items/item-1/adjustments",
    );
    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      direction: "INCREASE",
      quantity: 2,
      reason: "Count correction",
    });
    expect(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body)).not.toContain(
      "ADJUSTMENT_IN",
    );
  });

  it("uses exact assignment and return endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => Promise.resolve(jsonResponse({})));

    await inventoryAssignmentApi.create("item-1", { memberId: "member-1", quantity: 1 });
    await inventoryAssignmentApi.list({ page: 1, limit: 20, returnStatus: "OUTSTANDING" });
    await inventoryAssignmentApi.getById("assign-1");
    await inventoryAssignmentApi.returnItems("assign-1", { quantity: 1 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/items/item-1/assignments",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/assignments?page=1&limit=20&returnStatus=OUTSTANDING",
    );
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/assignments/assign-1",
    );
    expect(String(fetchMock.mock.calls[3]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/assignments/assign-1/returns",
    );
  });

  it("uses exact transaction and summary reads only", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => Promise.resolve(jsonResponse({})));

    await inventoryTransactionApi.list({
      page: 1,
      limit: 20,
      type: "STOCK_IN",
      actorId: "actor-1",
    });
    await inventorySummaryApi.get();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/transactions?page=1&limit=20&type=STOCK_IN&actorId=actor-1",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/inventory/summary",
    );
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBeUndefined();
  });
});
