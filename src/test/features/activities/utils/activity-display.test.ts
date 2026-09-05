import { describe, expect, it } from "vitest";
import { formatActivityCode } from "@/features/activities/utils/activity-display";

describe("formatActivityCode", () => {
  it("formats unknown future action codes safely", () => {
    expect(formatActivityCode("SOME_FUTURE_ACTION")).toBe("Some Future Action");
  });
});
