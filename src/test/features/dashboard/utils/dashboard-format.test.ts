import { describe, expect, it } from "vitest";
import {
  formatDashboardAverageMinutes,
  formatDashboardNumber,
  formatDashboardRate,
  formatTrendBucketDate,
} from "@/features/dashboard/utils/dashboard-format";

describe("dashboard-format", () => {
  it("preserves null metric semantics", () => {
    expect(formatDashboardNumber(null)).toBe("—");
    expect(formatDashboardRate(null)).toBe("—");
    expect(formatDashboardAverageMinutes(null)).toBe("—");
  });

  it("renders absent backend numeric fields as unavailable instead of crashing", () => {
    expect(formatDashboardNumber(undefined)).toBe("—");
    expect(formatDashboardRate(undefined)).toBe("—");
    expect(formatDashboardAverageMinutes(undefined)).toBe("—");
  });

  it("formats backend rate values directly", () => {
    expect(formatDashboardRate(47.25)).toBe("47.25%");
  });

  it("formats date-only trend buckets without local timezone day shifts", () => {
    expect(formatTrendBucketDate("2026-08-23")).toBe("Aug 23");
  });
});
