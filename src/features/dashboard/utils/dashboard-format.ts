import { formatDisplayDate } from "@/utils/date";
import type { DashboardTrendDays } from "../types/dashboard.types";

/**
 * Formats a metric quantity with comma grouping.
 * Defaults to "0" when null or undefined to provide user-friendly KPI counters.
 */
export const formatDashboardNumber = (
  value: number | null | undefined,
  fallback = "0",
): string => (value === null || value === undefined ? fallback : value.toLocaleString());

/**
 * Formats a metric percentage.
 * Defaults to "0%" when null or undefined to prevent unhelpful dash representations.
 */
export const formatDashboardRate = (
  value: number | null | undefined,
  fallback = "0%",
): string =>
  value === null || value === undefined ? fallback : `${Number(value.toFixed(2))}%`;

/**
 * Formats average completion minutes into human-readable duration (e.g., "45 min", "2h", "1h 30m").
 * Defaults to "0 min" when null, undefined, or zero.
 */
export const formatDashboardAverageMinutes = (
  minutes: number | null | undefined,
  fallback = "0 min",
): string => {
  if (minutes === null || minutes === undefined || minutes === 0) return fallback;
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
};

/**
 * Formats a numeric quantity with singular/plural unit labeling (e.g., "0 Teams", "1 Member", "4 Members").
 */
export const formatDashboardQuantity = (
  count: number | null | undefined,
  singular: string,
  plural: string,
): string => {
  const safe = count ?? 0;
  return `${formatDashboardNumber(safe)} ${safe === 1 ? singular : plural}`;
};

/**
 * Formats two numeric quantities with singular/plural unit labeling joined by a separator.
 * E.g., "1 Admin · 1 Member"
 */
export const formatDashboardDualQuantity = (
  countA: number | null | undefined,
  singularA: string,
  pluralA: string,
  countB: number | null | undefined,
  singularB: string,
  pluralB: string,
  separator = " · ",
): string => {
  const partA = formatDashboardQuantity(countA, singularA, pluralA);
  const partB = formatDashboardQuantity(countB, singularB, pluralB);
  return `${partA}${separator}${partB}`;
};

export const formatDashboardAsOf = (asOf: string): string => formatDisplayDate(asOf);

export const formatTrendDays = (days: DashboardTrendDays): string => `${days} Days`;

export const formatTrendBucketDate = (value: string): string => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, day));

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const formatDashboardStatusLabel = (value: string): string => value.replaceAll("_", " ");
