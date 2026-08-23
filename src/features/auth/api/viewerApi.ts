import { apiRequest, OperixApiError } from "@/lib/api";
import type { OperixViewer, OperixViewerScope, UserRole, UserStatus } from "@/types/auth";

const USER_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "MEMBER"];
const USER_STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const isViewerScope = (value: unknown): value is OperixViewerScope => {
  if (!isRecord(value) || typeof value.type !== "string") return false;

  if (value.type === "GLOBAL") return true;

  if (value.type === "ADMIN") {
    return (
      Array.isArray(value.teamIds) && value.teamIds.every((teamId) => typeof teamId === "string")
    );
  }

  if (value.type === "MEMBER") {
    return value.teamId === null || typeof value.teamId === "string";
  }

  return false;
};

const isOperixViewer = (value: unknown): value is OperixViewer =>
  isRecord(value) &&
  typeof value.userId === "string" &&
  USER_ROLES.includes(value.role as UserRole) &&
  USER_STATUSES.includes(value.status as UserStatus) &&
  isViewerScope(value.scope);

export const viewerApi = {
  getMe: async (): Promise<OperixViewer> => {
    const response = await apiRequest<unknown>("/viewer/me");

    if (!isOperixViewer(response)) {
      throw new OperixApiError("The viewer response was invalid.", {
        status: 200,
        code: "INVALID_RESPONSE",
        details: response,
      });
    }

    return response;
  },
};
