import { isOperixApiError } from "@/lib/api";

export type MemberErrorField = "email" | "employeeId" | "form";

export interface MemberErrorView {
  message: string;
  field?: MemberErrorField;
}

export const getMemberErrorView = (error: unknown): MemberErrorView => {
  if (!isOperixApiError(error)) {
    return {
      message: "Something went wrong while managing this Member.",
    };
  }

  switch (error.code) {
    case "MEMBER_NOT_FOUND":
      return {
        message: "Member unavailable or no longer accessible.",
      };
    case "EMAIL_ALREADY_EXISTS":
      return {
        field: "email",
        message: "A user with this email already exists.",
      };
    case "EMPLOYEE_ID_ALREADY_EXISTS":
      return {
        field: "employeeId",
        message: "A user with this employee ID already exists.",
      };
    case "ACCOUNT_PROVISIONING_FAILED":
      return {
        field: "form",
        message: "The Member account could not be provisioned. Please try again.",
      };
    case "FORBIDDEN":
      return {
        message: "You don't have permission to perform this action.",
      };
    default:
      return {
        message: error.message,
      };
  }
};
