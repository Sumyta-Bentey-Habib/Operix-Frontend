import type { UserRole } from "@/types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Chief / Super Admin",
  ADMIN: "Admin",
  MEMBER: "Member / Staff",
};

export const getRoleLabel = (role: UserRole | null): string =>
  role ? ROLE_LABELS[role] : "Operix User";
