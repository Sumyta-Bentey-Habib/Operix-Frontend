import { describe, expect, it } from "vitest";
import {
  reportDateInputToUtcIso,
  toReportDateInputValue,
  validateReportPeriod,
} from "./report-date";

describe("report date utilities", () => {
  it("serializes date input values to UTC midnight", () => {
    expect(reportDateInputToUtcIso("2026-08-23")).toBe("2026-08-23T00:00:00.000Z");
  });

  it("parses API date values back to date inputs without timezone shifting", () => {
    expect(toReportDateInputValue("2026-08-23T00:00:00.000Z")).toBe("2026-08-23");
    expect(toReportDateInputValue("2026-08-23")).toBe("2026-08-23");
  });

  it("allows same day periods", () => {
    expect(validateReportPeriod("2026-08-23", "2026-08-23")).toBeNull();
  });

  it("blocks only periods where start is after end", () => {
    expect(validateReportPeriod("2026-08-24", "2026-08-23")).toBe(
      "Period start must be earlier than or equal to period end.",
    );
  });
});
