import type { ManagedUser } from "@/features/user-management";
import type { UserStatus } from "@/types/auth";

export type Member = ManagedUser;

export interface CreateMemberInput {
  name: string;
  email: string;
  initialPassword: string;
  employeeId?: string;
  designation?: string;
}

export interface UpdateMemberInput {
  name?: string;
  employeeId?: string | null;
  designation?: string | null;
}

export interface UpdateMemberStatusInput {
  status: UserStatus;
}
