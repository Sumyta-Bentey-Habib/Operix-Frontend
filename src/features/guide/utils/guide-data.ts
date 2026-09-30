import type { UserRole } from "@/types/auth";
import adminGuide from "@/json/admin.json";
import memberGuide from "@/json/member.json";
import superAdminGuide from "@/json/superadmin.json";
import type { RoleUserGuide } from "../types/guide.types";

export const ROLE_GUIDES: Record<UserRole, RoleUserGuide> = {
  SUPER_ADMIN: superAdminGuide as unknown as RoleUserGuide,
  ADMIN: adminGuide as unknown as RoleUserGuide,
  MEMBER: memberGuide as unknown as RoleUserGuide,
};

export const getGuideForRole = (role?: UserRole | null): RoleUserGuide => {
  if (role === "SUPER_ADMIN") return ROLE_GUIDES.SUPER_ADMIN;
  if (role === "ADMIN") return ROLE_GUIDES.ADMIN;
  return ROLE_GUIDES.MEMBER;
};
