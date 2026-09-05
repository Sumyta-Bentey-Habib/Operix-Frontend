import { describe, expect, it } from "vitest";
import { buildDashboardWorkloadQuery } from "@/features/dashboard/hooks/use-dashboard-workload";

describe("buildDashboardWorkloadQuery", () => {
  it("sends pagination for Super Admin and Admin workload", () => {
    expect(buildDashboardWorkloadQuery("SUPER_ADMIN", 2, 20)).toEqual({ page: 2, limit: 20 });
    expect(buildDashboardWorkloadQuery("ADMIN", 3, 10)).toEqual({ page: 3, limit: 10 });
  });

  it("omits meaningless pagination for Member workload", () => {
    expect(buildDashboardWorkloadQuery("MEMBER", 2, 20)).toBeUndefined();
  });
});
