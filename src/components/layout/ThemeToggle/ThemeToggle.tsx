"use client";

import React from "react";
import styles from "./ThemeToggle.module.css";
import { SunIcon, MoonIcon } from "@/components/icons";
import { useTheme } from "@/context/ThemeContext";

export interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 18 }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const buttonClassName = className ? `${styles.toggleButton} ${className}` : styles.toggleButton;

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className={styles.iconWrapper}>
        {isDark ? (
          <SunIcon size={size} className={styles.sunIcon} />
        ) : (
          <MoonIcon size={size} className={styles.moonIcon} />
        )}
      </div>
    </button>
  );
};
