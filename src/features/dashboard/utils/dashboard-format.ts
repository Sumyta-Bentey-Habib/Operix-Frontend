import { formatDisplayDate } from "@/utils/date";
import type { DashboardTrendDays } from "../types/dashboard.types";

export const formatDashboardNumber = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : value.toLocaleString();

export const formatDashboardRate = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : `${Number(value.toFixed(2))}%`;

export const formatDashboardAverageMinutes = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
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
