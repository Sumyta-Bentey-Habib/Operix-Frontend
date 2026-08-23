import { formatDisplayDate } from "@/utils/date";
import type { PerformanceWindow } from "../types/performance.types";

export const formatPerformanceWindow = (window: PerformanceWindow): string => {
  if (window === "ALL_TIME") return "All Time";
  return window;
};

export const formatMetricAsOf = (asOf: string): string => formatDisplayDate(asOf);

export const formatRate = (value: number | null): string =>
  value === null ? "—" : `${Number(value.toFixed(2))}%`;

export const formatNumber = (value: number): string => value.toLocaleString();

export const formatAverageMinutes = (minutes: number | null): string => {
  if (minutes === null) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
};
