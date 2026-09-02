import type { UserRole } from "@/types/auth";

export type RegistrationRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SignupRequestInput {
  name: string;
  email: string;
  designation?: string | null;
  employeeId?: string | null;
}

export interface RegistrationRequest {
  id: string;
  publicId?: string;
  name: string;
  email: string;
  employeeId: string | null;
  designation: string | null;
  status: RegistrationRequestStatus;
  rejectionReason: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
