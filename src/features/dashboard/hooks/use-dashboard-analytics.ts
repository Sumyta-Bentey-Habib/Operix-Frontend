"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { obfuscateId } from "@/utils/id-obfuscator";
import { normalizeDashboardOverview } from "../utils/overview-normalizer";
import { useDashboardOverview } from "./use-dashboard-overview";
import { useDashboardTrends } from "./use-dashboard-trends";
import { useDashboardWorkload } from "./use-dashboard-workload";

/**
 * Composite hook that aggregates all dashboard data sources and auth context
 * into a single return value consumed by `DashboardAnalytics`.
 */
export const useDashboardAnalytics = () => {
  const { viewer, profile, hydrationStatus } = useAuth();
  const overviewState = useDashboardOverview();
  const workloadState = useDashboardWorkload(viewer?.role ?? null);
  const trendState = useDashboardTrends();
  const [selectedSnapshotDate, setSelectedSnapshotDate] = useState<string | undefined>(undefined);

  const normalizedOverview = useMemo(
    () => normalizeDashboardOverview(overviewState.overview, viewer),
    [overviewState.overview, viewer],
  );

  const displayName = profile?.name ?? profile?.email ?? obfuscateId(viewer?.userId ?? "", "USR");

  return {
    viewer,
    hydrationStatus,
    displayName,
    selectedSnapshotDate,
    setSelectedSnapshotDate,
    normalizedOverview,
    overviewState,
    workloadState,
    trendState,
  };
};
