import { isOperixApiError } from "@/lib/api";

export interface AdminErrorView {
  message: string;
  field?: "email" | "employeeId";
}

export const getAdminErrorView = (error: unknown): AdminErrorView => {
  if (!isOperixApiError(error)) {
    return { message: "The Admin request could not be completed." };
  }

  switch (error.code) {
    case "ADMIN_HAS_ASSIGNED_TEAMS":
      return {
        message:
          "This Admin still owns one or more teams. Reassign those teams before making the account inactive or suspended.",
      };
    case "EMAIL_ALREADY_EXISTS":
      return {
        field: "email",
        message: "An account already uses this email address.",
      };
    case "EMPLOYEE_ID_ALREADY_EXISTS":
      return {
        field: "employeeId",
        message: "An account already uses this employee ID.",
      };
    case "ACCOUNT_PROVISIONING_FAILED":
      return {
        message:
          "The Admin account could not be provisioned. Please check the details and try again.",
      };
    case "ADMIN_NOT_FOUND":
      return { message: "This Admin is unavailable or no longer exists." };
    case "FORBIDDEN":
      return { message: "You do not have permission to manage Admins." };
    default:
      return { message: error.message };
  }
};
