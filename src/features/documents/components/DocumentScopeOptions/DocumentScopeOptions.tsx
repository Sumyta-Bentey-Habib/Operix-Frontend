"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMembers } from "@/features/members/hooks/use-members";
import { useTeams } from "@/features/teams/hooks/use-teams";
import type { DocumentFilterState } from "../../types/document.types";
import {
  DOCUMENT_FIELD_CLASS,
  DOCUMENT_INPUT_CLASS,
  DOCUMENT_LABEL_CLASS,
} from "../DocumentFilters/DocumentFilters";

interface DocumentScopeOptionsProps {
  filters: DocumentFilterState;
  onChange: Dispatch<SetStateAction<DocumentFilterState>>;
}

export const DocumentScopeOptions = ({ filters, onChange }: DocumentScopeOptionsProps) => {
  const { members } = useMembers();
  const { teams } = useTeams();

  return (
    <>
      <label className={DOCUMENT_FIELD_CLASS}>
        <span className={DOCUMENT_LABEL_CLASS}>Member</span>
        <select
          className={DOCUMENT_INPUT_CLASS}
          value={filters.memberId}
          onChange={(event) =>
            onChange((current) => ({ ...current, memberId: event.target.value }))
          }
        >
          <option value="">All members</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>

      <label className={DOCUMENT_FIELD_CLASS}>
        <span className={DOCUMENT_LABEL_CLASS}>Team</span>
        <select
          className={DOCUMENT_INPUT_CLASS}
          value={filters.teamId}
          onChange={(event) => onChange((current) => ({ ...current, teamId: event.target.value }))}
        >
          <option value="">All teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};
