import { describe, expect, it } from "vitest";
import type { OperixViewer } from "@/types/auth";
import {
  buildInventoryAssignmentQuery,
  buildInventoryItemQuery,
  buildInventoryTransactionQuery,
  validateInventoryDateRange,
} from "./inventory-query";

const viewer = (role: OperixViewer["role"]): OperixViewer => ({
  userId: `${role.toLowerCase()}-1`,
  role,
  status: "ACTIVE",
  scope:
    role === "SUPER_ADMIN"
      ? { type: "GLOBAL" }
      : role === "ADMIN"
        ? { type: "ADMIN", teamIds: ["team-allowed"] }
        : { type: "MEMBER", teamId: "team-member" },
});

describe("inventory query builders", () => {
  it("builds Item queries with supported fields and lowStock true only", () => {
    expect(
      buildInventoryItemQuery(
        viewer("SUPER_ADMIN"),
        {
          q: ` ${"x".repeat(200)} `,
          categoryId: "cat-1",
          teamId: "team-1",
          isActive: "TRUE",
          isReturnable: "FALSE",
          lowStockOnly: true,
        },
        2,
        20,
      ),
    ).toEqual({
      page: 2,
      limit: 20,
      q: "x".repeat(180),
      categoryId: "cat-1",
      teamId: "team-1",
      isActive: true,
      isReturnable: false,
      lowStock: true,
    });
  });

  it("strips stale ADMIN teamId from Item, Assignment, and Transaction queries", () => {
    const admin = viewer("ADMIN");

    expect(
      buildInventoryItemQuery(
        admin,
        {
          q: "",
          categoryId: "",
          teamId: "team-stale",
          isActive: "ALL",
          isReturnable: "ALL",
          lowStockOnly: false,
        },
        1,
        20,
      ).teamId,
    ).toBeUndefined();

    expect(
      buildInventoryAssignmentQuery(
        admin,
        {
          teamId: "team-stale",
          itemId: "",
          memberId: "member-1",
          returnStatus: "OUTSTANDING",
          from: "",
          to: "",
        },
        1,
        20,
      ),
    ).toEqual({
      page: 1,
      limit: 20,
      memberId: "member-1",
      returnStatus: "OUTSTANDING",
    });

    expect(
      buildInventoryTransactionQuery(
        admin,
        {
          type: "ALL",
          teamId: "team-stale",
          itemId: "item-1",
          memberId: "",
          actorId: "actor-1",
          from: "",
          to: "",
        },
        1,
        20,
      ),
    ).toEqual({
      page: 1,
      limit: 20,
      itemId: "item-1",
      actorId: "actor-1",
    });
  });

  it("keeps only self-safe MEMBER Assignment filters", () => {
    const query = buildInventoryAssignmentQuery(
      viewer("MEMBER"),
      {
        teamId: "team-1",
        itemId: "item-1",
        memberId: "member-other",
        returnStatus: "PARTIALLY_RETURNED",
        from: "2026-08-23T10:00",
        to: "2026-08-24T10:00",
      },
      1,
      20,
    );

    expect(query.teamId).toBeUndefined();
    expect(query.memberId).toBeUndefined();
    expect(query.itemId).toBe("item-1");
    expect(query.returnStatus).toBe("PARTIALLY_RETURNED");
    expect(query.from).toContain("2026-08-23");
    expect(query.to).toContain("2026-08-24");
  });

  it("validates date ranges before Apply", () => {
    expect(validateInventoryDateRange("2026-08-24T10:00", "2026-08-23T10:00")).toBe(
      "From must be earlier than or equal to To.",
    );
    expect(validateInventoryDateRange("2026-08-23T10:00", "2026-08-24T10:00")).toBeNull();
  });
});
