import type { UserRole, UserStatus } from "@/types/auth";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  designation: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
