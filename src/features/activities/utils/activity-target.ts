import type { ActivityRecord } from "../types/activity.types";

export const resolveActivityTargetHref = (
  activity: Pick<ActivityRecord, "entityType" | "entityId">,
): string | null => {
  if (!activity.entityId) return null;

  switch (activity.entityType) {
    case "TASK":
      return `/tasks/${activity.entityId}`;
    case "TEAM":
      return `/teams/${activity.entityId}`;
    case "REPORT":
      return `/reports/${activity.entityId}`;
    default:
      return null;
  }
};
