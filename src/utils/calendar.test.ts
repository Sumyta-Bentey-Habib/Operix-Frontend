import { describe, expect, it } from "vitest";
import {
  formatYmd,
  parseYmd,
  formatCalendarDisplayDate,
  formatCalendarRangeDisplay,
  getCalendarDays,
  isDateInRange,
  isSameDate,
  PRESET_DATE_RANGES,
} from "./calendar";

describe("calendar utilities", () => {
  describe("formatYmd & parseYmd", () => {
    it("formats year, monthIndex, and day into YYYY-MM-DD", () => {
      expect(formatYmd(2026, 7, 29)).toBe("2026-08-29");
      expect(formatYmd(2026, 0, 5)).toBe("2026-01-05");
    });

    it("parses YYYY-MM-DD string", () => {
      const parsed = parseYmd("2026-08-29");
      expect(parsed).toEqual({ year: 2026, month: 7, day: 29 });
    });

    it("handles invalid date strings gracefully", () => {
      expect(parseYmd("")).toBeNull();
      expect(parseYmd("invalid")).toBeNull();
    });
  });

  describe("formatCalendarDisplayDate & formatCalendarRangeDisplay", () => {
    it("formats single date nicely", () => {
      expect(formatCalendarDisplayDate("2026-08-29")).toBe("29 Aug 2026");
    });

    it("formats date range nicely", () => {
      expect(formatCalendarRangeDisplay("2026-06-29", "2026-08-29")).toBe(
        "29 Jun 2026 - 29 Aug 2026",
      );
    });

    it("formats same start and end date as single date", () => {
      expect(formatCalendarRangeDisplay("2026-08-29", "2026-08-29")).toBe("29 Aug 2026");
    });
  });

  describe("isDateInRange & isSameDate", () => {
    it("correctly identifies dates within range", () => {
      expect(isDateInRange("2026-08-15", "2026-08-01", "2026-08-31")).toBe(true);
      expect(isDateInRange("2026-09-01", "2026-08-01", "2026-08-31")).toBe(false);
      expect(isDateInRange("2026-08-01", "2026-08-01", "2026-08-31")).toBe(true);
      expect(isDateInRange("2026-08-31", "2026-08-01", "2026-08-31")).toBe(true);
    });

    it("correctly checks same date", () => {
      expect(isSameDate("2026-08-29", "2026-08-29T10:00:00.000Z")).toBe(true);
      expect(isSameDate("2026-08-29", "2026-08-30")).toBe(false);
    });
  });

  describe("getCalendarDays", () => {
    it("returns array of days for August 2026", () => {
      const days = getCalendarDays(2026, 7); // August (0-indexed 7)
      expect(days.length).toBeGreaterThanOrEqual(35);

      const aug1 = days.find((d) => d.date === "2026-08-01");
      expect(aug1).toBeDefined();
      expect(aug1?.isCurrentMonth).toBe(true);
      expect(aug1?.day).toBe(1);

      const aug31 = days.find((d) => d.date === "2026-08-31");
      expect(aug31).toBeDefined();
      expect(aug31?.isCurrentMonth).toBe(true);
      expect(aug31?.day).toBe(31);
    });
  });

  describe("PRESET_DATE_RANGES", () => {
    it("provides expected preset ranges", () => {
      const ref = new Date(2026, 7, 29); // 29 Aug 2026
      const last7Days = PRESET_DATE_RANGES.find((p) => p.id === "last7days");
      expect(last7Days).toBeDefined();
      const range = last7Days?.getRange(ref);
      expect(range?.endDate).toBe("2026-08-29");
      expect(range?.startDate).toBe("2026-08-23");
    });
  });
});
