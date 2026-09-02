import { describe, expect, it } from "vitest";
import { getDynamicTabTitle, getRoleDashboardTitle } from "./document-title";

describe("document-title utility", () => {
  describe("getRoleDashboardTitle", () => {
    it("returns correct title for SUPER_ADMIN", () => {
      expect(getRoleDashboardTitle("SUPER_ADMIN")).toBe("Operix - Super Admin Dashboard");
    });

    it("returns correct title for ADMIN", () => {
      expect(getRoleDashboardTitle("ADMIN")).toBe("Operix - Admin Dashboard");
    });

    it("returns correct title for MEMBER", () => {
      expect(getRoleDashboardTitle("MEMBER")).toBe("Operix - Member Dashboard");
    });

    it("returns default dashboard title for unauthenticated/null role", () => {
      expect(getRoleDashboardTitle(null)).toBe("Operix - Dashboard");
      expect(getRoleDashboardTitle(undefined)).toBe("Operix - Dashboard");
    });
  });

  describe("getDynamicTabTitle", () => {
    it("returns role-based dashboard title when activeTab is dashboard", () => {
      expect(getDynamicTabTitle({ activeTab: "dashboard", role: "ADMIN" })).toBe(
        "Operix - Admin Dashboard",
      );
      expect(getDynamicTabTitle({ activeTab: "dashboard", role: "SUPER_ADMIN" })).toBe(
        "Operix - Super Admin Dashboard",
      );
      expect(getDynamicTabTitle({ activeTab: "dashboard", role: "MEMBER" })).toBe(
        "Operix - Member Dashboard",
      );
      expect(getDynamicTabTitle({ activeTab: "dashboard", role: null })).toBe("Operix - Dashboard");
    });

    it("returns role-based dashboard title when pathname is /dashboard", () => {
      expect(getDynamicTabTitle({ pathname: "/dashboard", role: "ADMIN" })).toBe(
        "Operix - Admin Dashboard",
      );
    });

    it("returns correct tab title for standard navigation tabs", () => {
      expect(getDynamicTabTitle({ activeTab: "admins", role: "SUPER_ADMIN" })).toBe(
        "Operix - Admins",
      );
      expect(getDynamicTabTitle({ activeTab: "members", role: "ADMIN" })).toBe("Operix - Members");
      expect(getDynamicTabTitle({ activeTab: "teams", role: "ADMIN" })).toBe("Operix - Teams");
      expect(getDynamicTabTitle({ activeTab: "tasks", role: "ADMIN" })).toBe("Operix - Tasks");
      expect(getDynamicTabTitle({ activeTab: "kpi", role: "ADMIN" })).toBe("Operix - KPIs");
      expect(getDynamicTabTitle({ activeTab: "reports", role: "ADMIN" })).toBe("Operix - Reports");
      expect(getDynamicTabTitle({ activeTab: "inventory", role: "ADMIN" })).toBe(
        "Operix - Inventory",
      );
      expect(getDynamicTabTitle({ activeTab: "documents", role: "ADMIN" })).toBe(
        "Operix - Documents",
      );
      expect(getDynamicTabTitle({ activeTab: "contacts", role: "ADMIN" })).toBe(
        "Operix - Contacts",
      );
    });

    it("returns correct tab title for override tab IDs", () => {
      expect(getDynamicTabTitle({ activeTab: "history" })).toBe("Operix - Activity Feed");
      expect(getDynamicTabTitle({ activeTab: "activity" })).toBe("Operix - Activity Feed");
      expect(getDynamicTabTitle({ activeTab: "notifications" })).toBe("Operix - Notifications");
      expect(getDynamicTabTitle({ activeTab: "submissions" })).toBe("Operix - Task Submissions");
    });

    it("prioritizes custom pageTitle when provided", () => {
      expect(
        getDynamicTabTitle({
          activeTab: "tasks",
          pageTitle: "Create Task",
          role: "ADMIN",
        }),
      ).toBe("Operix - Create Task");

      expect(
        getDynamicTabTitle({
          activeTab: "tasks",
          pageTitle: "Operix - Custom Task Detail",
          role: "ADMIN",
        }),
      ).toBe("Operix - Custom Task Detail");
    });

    it("returns default app name if nothing is specified", () => {
      expect(getDynamicTabTitle({})).toBe("Operix");
    });
  });
});
