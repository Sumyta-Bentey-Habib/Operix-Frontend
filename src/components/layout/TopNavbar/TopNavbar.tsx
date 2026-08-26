"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
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
    if (pathname.startsWith("/inventory")) return "inventory";
    if (pathname.startsWith("/documents")) return "documents";
    if (pathname.startsWith("/activity") || pathname.startsWith("/history")) return "history";
    if (pathname.startsWith("/contacts")) return "contacts";
    return activeTabId || "dashboard";
  })();

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile nav on route transition without triggering cascading render effect
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileNavOpen(false);
  }

  const handleLogout = () => {
    setLogoutError(null);
    void signOut()
      .then(() => {
        router.replace("/");
      })
      .catch((error: unknown) => {
        setLogoutError(
          error instanceof Error ? error.message : "Unable to log out. Please try again.",
        );
      });
  };

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

        <div className={styles.desktopThemeToggle}>
          <ThemeToggle />
        </div>

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
                  handleLogout();
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

        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          className={styles.hamburgerButton}
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
          aria-expanded={isMobileNavOpen}
          aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-nav-drawer"
        >
          <span
            className={`${styles.hamburgerLine} ${isMobileNavOpen ? styles.hamburgerLineOpen1 : ""}`}
          />
          <span
            className={`${styles.hamburgerLine} ${isMobileNavOpen ? styles.hamburgerLineOpen2 : ""}`}
          />
          <span
            className={`${styles.hamburgerLine} ${isMobileNavOpen ? styles.hamburgerLineOpen3 : ""}`}
          />
        </button>
      </div>

      {/* Mobile Navigation Drawer & Backdrop */}
      {isMobileNavOpen && (
        <div className={styles.mobileNavBackdrop} onClick={closeMobileNav} role="presentation">
          <div
            id="mobile-nav-drawer"
            ref={mobileNavRef}
            className={styles.mobileNavDrawer}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileNavHeader}>
              <div className={styles.mobileNavUserSection}>
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  width={42}
                  height={42}
                  className={styles.mobileNavAvatar}
                  unoptimized
                />
                <div className={styles.mobileNavUserInfo}>
                  <span className={styles.mobileNavUserName}>{currentUser.name}</span>
                  <span className={styles.mobileNavUserRole}>{currentUser.roleLabel}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.mobileNavCloseBtn}
                onClick={closeMobileNav}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className={styles.mobileNavList} aria-label="Mobile navigation links">
              {visibleTabs.map((tab) => {
                const isActive = tab.id === currentTabId;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavActiveItem : ""}`}
                    onClick={() => {
                      onTabChange?.(tab.id);
                      closeMobileNav();
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{tab.label}</span>
                    {isActive && <span className={styles.activeDot} />}
                  </Link>
                );
              })}
            </nav>

            <div className={styles.mobileNavFooter}>
              <div className={styles.mobileThemeRow}>
                <span className={styles.mobileThemeLabel}>Appearance</span>
                <ThemeToggle />
              </div>
              <button
                type="button"
                className={styles.mobileLogoutBtn}
                onClick={() => {
                  closeMobileNav();
                  handleLogout();
                }}
              >
                <LogoutIcon size={18} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
