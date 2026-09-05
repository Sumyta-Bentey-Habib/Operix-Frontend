import { describe, expect, it } from "vitest";
import { resolveNotificationTargetHref } from "@/features/notifications/utils/notification-target";

describe("resolveNotificationTargetHref", () => {
  it("links supported targets with an id", () => {
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
    expect(
      resolveNotificationTargetHref({
        targetType: "REGISTRATION_REQUEST",
        targetId: "req-1",
      }),
    ).toBe("/admins?tab=pending");
    expect(
      resolveNotificationTargetHref({
        targetType: "USER_REGISTRATION",
        targetId: null,
      }),
    ).toBe("/admins?tab=pending");
  });

  it("does not invent unsupported or incomplete target links", () => {
    expect(
      resolveNotificationTargetHref({ targetType: "INVENTORY", targetId: "item-1" }),
    ).toBeNull();
    expect(resolveNotificationTargetHref({ targetType: null, targetId: "task-1" })).toBeNull();
  });
});
