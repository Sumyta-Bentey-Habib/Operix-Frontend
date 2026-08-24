/**
 * Operix Design System Color Palette & CSS Variables
 * Defines color tokens for both Light and Dark themes,
 * as well as direct CSS variable mappings for styled components.
 */

export const THEME_COLORS = {
  light: {
    // Canvas & Surface Backgrounds
    bgCanvas: "#f4f5f9",
    bgSurface: "#ffffff",
    bgCard: "#ffffff",
    bgCardSubtle: "#f9fafb",
    bgCardHover: "#f3f4f6",
    bgDropdown: "#ffffff",
    bgInput: "#ffffff",
    bgMuted: "#f3f4f6",
    bgPage: "#f4f5f9",

    // Typography Colors
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    textInverse: "#ffffff",
    textOnPrimary: "#ffffff",

    // Borders & Dividers
    borderSubtle: "#edf0f5",
    borderDefault: "#e5e7eb",
    borderHover: "#d1d5db",

    // Primary Emerald Brand Accent
    primaryEmerald: "#059669",
    primaryEmeraldHover: "#047857",
    primaryEmeraldLight: "#e6f7f0",
    primaryEmeraldDark: "#065f46",
    primaryEmeraldMuted: "#d1fae5",
    primaryEmeraldGlow: "rgba(5, 150, 105, 0.25)",

    // Status Badges & Alerts
    positiveBg: "#e6f7f0",
    positiveText: "#059669",
    negativeBg: "#fef2f2",
    negativeText: "#dc2626",
    pendingBg: "#fef3c7",
    pendingText: "#d97706",
    destructive: "#dc2626",
    warningBg: "#fef3c7",
    warningText: "#d97706",

    // Cards & Elements
    cardShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
    cardHoverShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
    dropdownShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    shadowSm: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
    gridLineColor: "#f3f4f6",
    tableRowHover: "#fcfdfe",
    scrollbarThumb: "#d1d5db",
    scrollbarThumbHover: "#9ca3af",
  },
  dark: {
    // Canvas & Surface Backgrounds
    bgCanvas: "#0b0f17",
    bgSurface: "#131b2e",
    bgCard: "#131b2e",
    bgCardSubtle: "#1a233a",
    bgCardHover: "#1e2942",
    bgDropdown: "#131b2e",
    bgInput: "#1a233a",
    bgMuted: "#1e2942",
    bgPage: "#0b0f17",

    // Typography Colors
    textPrimary: "#f1f5f9",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textInverse: "#0b0f17",
    textOnPrimary: "#ffffff",

    // Borders & Dividers
    borderSubtle: "#1e293b",
    borderDefault: "#2a374f",
    borderHover: "#3b4b66",

    // Primary Emerald Brand Accent
    primaryEmerald: "#10b981",
    primaryEmeraldHover: "#059669",
    primaryEmeraldLight: "rgba(16, 185, 129, 0.15)",
    primaryEmeraldDark: "#047857",
    primaryEmeraldMuted: "rgba(16, 185, 129, 0.2)",
    primaryEmeraldGlow: "rgba(16, 185, 129, 0.35)",

    // Status Badges & Alerts
    positiveBg: "rgba(16, 185, 129, 0.15)",
    positiveText: "#34d399",
    negativeBg: "rgba(239, 68, 68, 0.15)",
    negativeText: "#f87171",
    pendingBg: "rgba(245, 158, 11, 0.15)",
    pendingText: "#fbbf24",
    destructive: "#f87171",
    warningBg: "rgba(245, 158, 11, 0.15)",
    warningText: "#fbbf24",

    // Cards & Elements
    cardShadow: "0 4px 20px rgba(0, 0, 0, 0.45)",
    cardHoverShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
    dropdownShadow: "0 12px 32px rgba(0, 0, 0, 0.65)",
    shadowSm: "0 2px 8px rgba(0, 0, 0, 0.35)",
    gridLineColor: "#1e293b",
    tableRowHover: "rgba(255, 255, 255, 0.03)",
    scrollbarThumb: "#334155",
    scrollbarThumbHover: "#475569",
  },
} as const;

/**
 * CSS Variable references for use in JavaScript styles or dynamic inline styles
 */
export const CSS_VARS = {
  // Backgrounds
  bgCanvas: "var(--bg-canvas)",
  bgSurface: "var(--bg-surface)",
  bgCard: "var(--bg-card)",
  bgCardSubtle: "var(--bg-card-subtle)",
  bgCardHover: "var(--bg-card-hover)",
  bgDropdown: "var(--bg-dropdown)",
  bgInput: "var(--bg-input)",
  bgMuted: "var(--bg-muted)",
  bgPage: "var(--bg-page)",

  // Text
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  textInverse: "var(--text-inverse)",
  textOnPrimary: "var(--text-on-primary)",

  // Borders
  borderSubtle: "var(--border-subtle)",
  borderDefault: "var(--border-default)",
  borderHover: "var(--border-hover)",

  // Primary Brand
  primaryEmerald: "var(--primary-emerald)",
  primaryEmeraldHover: "var(--primary-emerald-hover)",
  primaryEmeraldLight: "var(--primary-emerald-light)",
  primaryEmeraldDark: "var(--primary-emerald-dark)",
  primaryEmeraldMuted: "var(--primary-emerald-muted)",
  primaryEmeraldGlow: "var(--primary-emerald-glow)",

  // Badges / Feedback
  positiveBg: "var(--badge-positive-bg)",
  positiveText: "var(--badge-positive-text)",
  negativeBg: "var(--badge-negative-bg)",
  negativeText: "var(--badge-negative-text)",
  pendingBg: "var(--badge-pending-bg)",
  pendingText: "var(--badge-pending-text)",
  destructive: "var(--destructive)",
  warningBg: "var(--warning-bg)",
  warningText: "var(--warning-text)",

  // Shadows & Effects
  cardShadow: "var(--card-shadow)",
  cardHoverShadow: "var(--card-hover-shadow)",
  dropdownShadow: "var(--dropdown-shadow)",
  shadowSm: "var(--shadow-sm)",
  gridLineColor: "var(--grid-line-color)",
  tableRowHover: "var(--table-row-hover)",
  scrollbarThumb: "var(--scrollbar-thumb)",
  scrollbarThumbHover: "var(--scrollbar-thumb-hover)",
} as const;

export type ThemeMode = "light" | "dark";
export type ThemeColors = typeof THEME_COLORS.light;
export type CssVars = typeof CSS_VARS;
