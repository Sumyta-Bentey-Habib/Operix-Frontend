import type { Admin } from "@/features/admins/types/admin.types";
import type { Member } from "@/features/members/types/member.types";

export interface Team {
  id: string;
  name: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamListParams {
  page: number;
  limit: number;
}

export interface CreateTeamInput {
  name: string;
  adminId: string;
}

export interface UpdateTeamInput {
  name?: string;
}

export interface ReassignTeamAdminInput {
  adminId: string;
}

export interface AssignTeamMemberInput {
  memberId: string;
}

export interface TransferMemberInput {
  targetTeamId: string;
}

export type PickableAdmin = Admin;
export type PickableMember = Member;
