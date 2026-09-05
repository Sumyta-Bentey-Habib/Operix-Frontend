import { describe, expect, it } from "vitest";
import { buildMemberPerformanceQuery } from "@/features/performance/types/performance.types";

describe("buildMemberPerformanceQuery", () => {
  it("allows SUPER_ADMIN to send a Team filter", () => {
    expect(
      buildMemberPerformanceQuery(
        { role: "SUPER_ADMIN" },
        {
          teamId: " team-1 ",
        },
        1,
        20,
      ),
    ).toEqual({ page: 1, limit: 20, teamId: "team-1" });
  });

  it("strips stale Team filter values for ADMIN", () => {
    expect(
      buildMemberPerformanceQuery(
        { role: "ADMIN" },
        {
          teamId: "team-old",
        },
        3,
        20,
      ),
    ).toEqual({ page: 3, limit: 20 });
  });
});
