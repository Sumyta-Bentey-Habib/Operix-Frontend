"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./TopNavbar.module.css";
import { LogoIcon, SearchIcon, LogoutIcon } from "@/components/icons";
import { ThemeToggle } from "../ThemeToggle";
import { TOP_NAV_TABS } from "@/constants/navigation";
import { APP_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import { USER_PROFILE_DATA } from "@/data/dashboardData";
import { canSeeNavigationItem } from "@/lib/auth/permissions";
import { getRoleLabel } from "@/lib/auth/roles";
import { NotificationBell } from "@/features/notifications";

export interface TopNavbarProps {
  activeTabId?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTabId,
  className,
  onTabChange,
  onSearchClick,
}) => {
  const { viewer, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentUser = {
    name: profile?.name || viewer?.userId || USER_PROFILE_DATA.name,
    email: profile?.email || viewer?.userId || "Authenticated user",
    roleLabel: getRoleLabel(viewer?.role ?? null),
    avatarUrl: USER_PROFILE_DATA.avatarUrl,
  };
  const visibleTabs = TOP_NAV_TABS.filter((tab) => canSeeNavigationItem(viewer, tab.id));

  // Determine active tab from pathname or activeTabId prop
  const currentTabId = (() => {
    if (activeTabId && activeTabId !== "dashboard") return activeTabId;
    if (!pathname || pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname.startsWith("/kpi")) return "kpi";
    if (pathname.startsWith("/reports")) return "reports";
    if (pathname.startsWith("/documents")) return "documents";
    if (pathname.startsWith("/activity") || pathname.startsWith("/history")) return "history";
    if (pathname.startsWith("/contacts")) return "contacts";
    return activeTabId || "dashboard";
  })();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navbarClassName = className ? `${styles.navbar} ${className}` : styles.navbar;

  return (
    <header className={navbarClassName}>
      <Link href="/dashboard" className={styles.leftSection} style={{ textDecoration: "none" }}>
        <div className={styles.logoIcon}>
          <LogoIcon size={32} />
        </div>
        <span className={styles.brandName}>{APP_STRINGS.appName}</span>
      </Link>

      <nav className={styles.centerSection} aria-label={APP_STRINGS.ariaLabels.topNavigation}>
        <div className={styles.navTabs}>
          {visibleTabs.map((tab) => {
            const isActive = tab.id === currentTabId;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                onClick={() => onTabChange?.(tab.id)}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={styles.rightSection}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={APP_STRINGS.ariaLabels.search}
          title={APP_STRINGS.actions.searchPlaceholder}
          onClick={onSearchClick}
        >
          <SearchIcon size={18} />
        </button>

        <NotificationBell
          ariaLabel={APP_STRINGS.ariaLabels.notifications}
          title={APP_STRINGS.actions.notifications}
        />

        <ThemeToggle />

        <div
          ref={menuRef}
          className={styles.avatarWrapper}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={APP_STRINGS.ariaLabels.userProfile}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsMenuOpen((prev) => !prev);
          }}
        >
          <div className={styles.userBadgeGroup}>
            <span className={styles.userNameLabel}>{currentUser.name}</span>
            <span className={styles.userRoleBadge}>{currentUser.roleLabel}</span>
          </div>

          <Image
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            width={38}
            height={38}
            className={styles.avatarImage}
            unoptimized
          />

          {isMenuOpen && (
            <div className={styles.userDropdownMenu}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{currentUser.name}</div>
                <div className={styles.dropdownEmail}>{currentUser.email}</div>
                <span className={styles.dropdownRole}>{currentUser.roleLabel}</span>
              </div>

              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setLogoutError(null);
                  void signOut()
                    .then(() => {
                      router.replace("/");
                    })
                    .catch((error: unknown) => {
                      setLogoutError(
                        error instanceof Error
                          ? error.message
                          : "Unable to log out. Please try again.",
                      );
                    });
                }}
              >
                <LogoutIcon size={16} />
                <span>Log out</span>
              </button>
              {logoutError && (
                <div className={styles.dropdownEmail} role="alert">
                  {logoutError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
