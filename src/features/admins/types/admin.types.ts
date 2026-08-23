import type { ManagedUser } from "@/features/user-management";
import type { UserStatus } from "@/types/auth";

export type Admin = ManagedUser;

export interface CreateAdminInput {
  name: string;
  email: string;
  initialPassword: string;
  employeeId?: string;
  designation?: string;
}

export interface UpdateAdminInput {
  name?: string;
  employeeId?: string | null;
  designation?: string | null;
}

export interface UpdateAdminStatusInput {
  status: UserStatus;
}

export interface AdminListParams {
  page: number;
  limit: number;
}
