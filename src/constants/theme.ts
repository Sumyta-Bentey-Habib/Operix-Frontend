/**
 * Theme Type Definitions and Constants
 */

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "operix-theme";

export const THEME_OPTIONS: { id: Theme; label: string; icon: "sun" | "moon" | "system" }[] = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
  { id: "system", label: "System", icon: "system" },
];
