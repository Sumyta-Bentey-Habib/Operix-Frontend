import { describe, expect, it } from "vitest";
import { resolveNotificationTargetHref } from "./notification-target";

describe("resolveNotificationTargetHref", () => {
  it("links only supported targets with an id", () => {
    expect(resolveNotificationTargetHref({ targetType: "TASK", targetId: "task-1" })).toBe(
      "/tasks/task-1",
    );
    expect(resolveNotificationTargetHref({ targetType: "SUBMISSION", targetId: "sub-1" })).toBe(
      "/submissions/sub-1",
    );
    expect(resolveNotificationTargetHref({ targetType: "TEAM", targetId: "team-1" })).toBe(
      "/teams/team-1",
    );
    expect(resolveNotificationTargetHref({ targetType: "REPORT", targetId: "report-1" })).toBe(
      "/reports/report-1",
    );
    expect(
      resolveNotificationTargetHref({
        targetType: "INVENTORY_ASSIGNMENT",
        targetId: "assignment-1",
      }),
    ).toBe("/inventory/assignments/assignment-1");
  });

  it("does not invent unsupported or incomplete target links", () => {
    expect(
      resolveNotificationTargetHref({ targetType: "INVENTORY", targetId: "item-1" }),
    ).toBeNull();
    expect(resolveNotificationTargetHref({ targetType: "TASK", targetId: null })).toBeNull();
    expect(resolveNotificationTargetHref({ targetType: null, targetId: "task-1" })).toBeNull();
  });
});
