"use client";

import { useMemo, useState } from "react";
import type { MemberWorkloadRow } from "../../types/dashboard.types";
import {
  normalizeMemberWorkloadRow,
  type NormalizedMemberWorkload,
} from "../../utils/workload-normalizer";

export interface UseMemberWorkloadFilterResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  normalizedMembers: NormalizedMemberWorkload[];
  filteredMembers: NormalizedMemberWorkload[];
  totalActive: number;
  totalOverdue: number;
}

export const useMemberWorkloadFilter = (
  members: MemberWorkloadRow[],
): UseMemberWorkloadFilterResult => {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedMembers: NormalizedMemberWorkload[] = useMemo(() => {
    if (!Array.isArray(members)) return [];
    return members.map((row, index) => normalizeMemberWorkloadRow(row, index));
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedMembers;

    return normalizedMembers.filter((m) => {
      const nameMatch = m.displayName.toLowerCase().includes(q);
      const empIdMatch = m.employeeId ? m.employeeId.toLowerCase().includes(q) : false;
      const teamMatch = m.teamName ? m.teamName.toLowerCase().includes(q) : false;
      const desigMatch = m.designation ? m.designation.toLowerCase().includes(q) : false;
      return nameMatch || empIdMatch || teamMatch || desigMatch;
    });
  }, [normalizedMembers, searchQuery]);

  const totalActive = useMemo(
    () => normalizedMembers.reduce((acc, curr) => acc + curr.activeTasks, 0),
    [normalizedMembers],
  );

  const totalOverdue = useMemo(
    () => normalizedMembers.reduce((acc, curr) => acc + curr.overdueTasks, 0),
    [normalizedMembers],
  );

  const clearSearch = () => setSearchQuery("");

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    normalizedMembers,
    filteredMembers,
    totalActive,
    totalOverdue,
  };
};
