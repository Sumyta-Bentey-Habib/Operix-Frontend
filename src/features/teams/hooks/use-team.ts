"use client";

import { useCallback, useEffect, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { teamApi } from "../api/team.api";
import type { Team } from "../types/team.types";

export const useTeam = (teamId: string) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);

  const fetchTeam = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const response = await teamApi.getById(teamId, { signal });
        if (signal?.aborted) return;
        setTeam(response);
      } catch (fetchError) {
        if (signal?.aborted) return;
        setError(fetchError as OperixApiError | Error);
        setTeam(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [teamId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchTeam(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchTeam]);

  return {
    team,
    loading,
    error,
    setTeam,
    refresh: () => fetchTeam(),
  };
};
