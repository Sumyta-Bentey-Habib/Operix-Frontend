import type { UserRole } from "@/types/auth";

export type RegistrationRequestStatus = "PENDING" | "APPROVING" | "APPROVED" | "REJECTED";

/**
 * `ACCEPTED` means the Operix SMTP server accepted the message for delivery.
 * It is not proof that the recipient inbox received it.
 */
export type MailOutcome = "ACCEPTED" | "FAILED";

export interface SetupEmailStatus {
  status: MailOutcome;
}

export interface RegistrationRequestTeam {
  id: string;
  name: string;
}

export interface RegistrationRequestReviewer {
  id: string;
  name: string;
}

/**
 * Mirrors `mapRegistrationRequest` on the backend. Field names must stay in
 * sync with `registration.mapper.ts`.
 */
export interface RegistrationRequest {
  id: string;
  publicId?: string;
  name: string;
  email: string;
  status: RegistrationRequestStatus;
  selectedRole: Extract<UserRole, "ADMIN" | "MEMBER"> | null;
  selectedEmployeeId: string | null;
  selectedDesignation: string | null;
  selectedTeam: RegistrationRequestTeam | null;
  reviewer: RegistrationRequestReviewer | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  passwordConfiguredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveRegistrationResult extends RegistrationRequest {
  setupEmail: SetupEmailStatus;
}

export interface ResendSetupResult {
  message: string;
  setupEmail: SetupEmailStatus;
}

export interface SignupRequestInput {
  name: string;
  email: string;
  designation?: string | null;
  employeeId?: string | null;
}

export interface ApproveRegistrationInput {
  role: Extract<UserRole, "ADMIN" | "MEMBER">;
  employeeId?: string | null;
  designation?: string | null;
  teamId?: string | null;
}

export interface RejectRegistrationInput {
  reason?: string;
}

export interface SetupPasswordInput {
  token: string;
  password: string;
}

export interface PasswordValidationResult {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  passwordsMatch: boolean;
  isValid: boolean;
}
