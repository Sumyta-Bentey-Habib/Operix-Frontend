import { apiRequest } from "@/lib/api";
import type { Team, TransferMemberInput } from "../types/team.types";

export const teamMembershipApi = {
  transferMember: (memberId: string, input: TransferMemberInput): Promise<Team> =>
    apiRequest(`/members/${memberId}/transfer`, {
      method: "POST",
      json: input,
    }),
};
