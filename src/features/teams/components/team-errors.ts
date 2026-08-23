import { isOperixApiError } from "@/lib/api";

export interface TeamErrorView {
  message: string;
  title?: string;
}

export const getTeamErrorView = (error: unknown): TeamErrorView => {
  if (!isOperixApiError(error)) {
    return {
      message: "Something went wrong. Please try again.",
    };
  }

  switch (error.code) {
    case "TEAM_NOT_FOUND":
      return {
        title: "Team unavailable",
        message: "Team unavailable.",
      };
    case "TEAM_ALREADY_ASSIGNED_TO_ADMIN":
      return {
        message: "This Team is already assigned to the selected Admin.",
      };
    case "TARGET_ADMIN_NOT_ACTIVE":
      return {
        message: "The selected or target Team does not currently have an active Admin.",
      };
    case "TARGET_MEMBER_NOT_ACTIVE":
      return {
        message: "Only active Members can be newly assigned to a Team.",
      };
    case "MEMBER_ALREADY_ASSIGNED":
      return {
        message: "This Member is already assigned to a Team. Use Transfer instead.",
      };
    case "MEMBER_NOT_ASSIGNED":
      return {
        message: "This Member is not currently assigned to a Team. Use Team assignment instead.",
      };
    case "MEMBER_ALREADY_IN_TARGET_TEAM":
      return {
        message: "This Member is already assigned to the selected Team.",
      };
    case "MEMBER_ASSIGNMENT_CHANGED":
      return {
        message:
          "The Member's Team assignment changed while this request was being processed. Refresh and try again.",
      };
    case "MEMBER_NOT_FOUND":
      return {
        message: "Member unavailable.",
      };
    case "FORBIDDEN":
      return {
        message: "You do not have permission to perform this action.",
      };
    default:
      return {
        message: error.message || "Something went wrong. Please try again.",
      };
  }
};
