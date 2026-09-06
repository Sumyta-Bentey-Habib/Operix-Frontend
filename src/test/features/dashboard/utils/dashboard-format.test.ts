import { describe, expect, it } from "vitest";
import {
  formatDashboardAverageMinutes,
  formatDashboardNumber,
  formatDashboardQuantity,
  formatDashboardRate,
  formatTrendBucketDate,
} from "@/features/dashboard/utils/dashboard-format";

describe("dashboard-format", () => {
  it("defaults null metric values to user-friendly zero defaults", () => {
    expect(formatDashboardNumber(null)).toBe("0");
    expect(formatDashboardRate(null)).toBe("0%");
    expect(formatDashboardAverageMinutes(null)).toBe("0 min");
  });

  it("defaults undefined numeric fields to user-friendly zero defaults", () => {
    expect(formatDashboardNumber(undefined)).toBe("0");
    expect(formatDashboardRate(undefined)).toBe("0%");
    expect(formatDashboardAverageMinutes(undefined)).toBe("0 min");
  });

  it("supports custom fallback when explicitly specified", () => {
    expect(formatDashboardNumber(null, "—")).toBe("—");
    expect(formatDashboardRate(null, "N/A")).toBe("N/A");
    expect(formatDashboardAverageMinutes(null, "—")).toBe("—");
  });

  it("formats backend rate values directly", () => {
    expect(formatDashboardRate(47.25)).toBe("47.25%");
    expect(formatDashboardRate(0)).toBe("0%");
  });

  it("formats duration in minutes and hours", () => {
    expect(formatDashboardAverageMinutes(0)).toBe("0 min");
    expect(formatDashboardAverageMinutes(45)).toBe("45 min");
    expect(formatDashboardAverageMinutes(60)).toBe("1h");
    expect(formatDashboardAverageMinutes(95)).toBe("1h 35m");
  });

  it("formats quantities with proper singular and plural labels", () => {
    expect(formatDashboardQuantity(0, "Team", "Teams")).toBe("0 Teams");
    expect(formatDashboardQuantity(1, "Team", "Teams")).toBe("1 Team");
    expect(formatDashboardQuantity(3, "Team", "Teams")).toBe("3 Teams");
    expect(formatDashboardQuantity(null, "Member", "Members")).toBe("0 Members");
  });

  it("formats date-only trend buckets without local timezone day shifts", () => {
    expect(formatTrendBucketDate("2026-08-23")).toBe("Aug 23");
  });
});
