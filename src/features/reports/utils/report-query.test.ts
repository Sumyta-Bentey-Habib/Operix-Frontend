import { describe, expect, it } from "vitest";
import type { OperixViewer } from "@/types/auth";
import { buildManagementReportListQuery } from "./report-query";

const viewer = (role: OperixViewer["role"]): OperixViewer =>
  ({
    userId: `${role.toLowerCase()}-1`,
    role,
    status: "ACTIVE",
    scope: role === "SUPER_ADMIN" ? { type: "GLOBAL" } : { type: role, teamIds: [] },
  }) as OperixViewer;

describe("buildManagementReportListQuery", () => {
  it("allows SUPER_ADMIN to send supported filters", () => {
    expect(
      buildManagementReportListQuery(
        viewer("SUPER_ADMIN"),
        {
          status: "SUBMITTED",
          teamId: " team-1 ",
          adminId: " admin-1 ",
          q: " Weekly ",
        },
        2,
        20,
      ),
    ).toEqual({
      page: 2,
      limit: 20,
      status: "SUBMITTED",
      teamId: "team-1",
      adminId: "admin-1",
      q: "Weekly",
    });
  });

  it("strips stale adminId for ADMIN at the query boundary", () => {
    expect(
      buildManagementReportListQuery(
        viewer("ADMIN"),
        {
          status: "APPROVED",
          teamId: "team-1",
          adminId: "admin-1",
          q: "report",
        },
        1,
        20,
      ),
    ).toEqual({
      page: 1,
      limit: 20,
      status: "APPROVED",
      teamId: "team-1",
      q: "report",
    });
  });

  it("omits blank filters and caps title search at 100 characters", () => {
    const longQuery = "x".repeat(120);

    const query = buildManagementReportListQuery(
      viewer("SUPER_ADMIN"),
      {
        status: "ALL",
        teamId: "   ",
        adminId: "",
        q: longQuery,
      },
      0,
      200,
    );

    expect(query.page).toBe(1);
    expect(query.limit).toBe(100);
    expect(query.status).toBeUndefined();
    expect(query.teamId).toBeUndefined();
    expect(query.adminId).toBeUndefined();
    expect(query.q).toHaveLength(100);
  });
});
