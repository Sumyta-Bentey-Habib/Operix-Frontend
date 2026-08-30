"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./TopNavbar.module.css";
import {
  LogoIcon,
  SearchIcon,
  LogoutIcon,
  ChevronDownIcon,
  DashboardIcon,
  CheckCircleIcon,
  BarChartIcon,
  ReportsIcon,
  ContactsIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  MailIcon,
  WorkspaceIcon,
  DocumentsIcon,
  TodoIcon,
  HistoryIcon,
} from "@/components/icons";
import { ThemeToggle } from "../ThemeToggle";
import {
  TOP_NAV_PRIMARY_TABS,
  TOP_NAV_GROUPS,
  TOP_NAV_TABS,
  NavItemDetail,
} from "@/constants/navigation";
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

const getNavIcon = (id: string, size = 16) => {
  switch (id) {
    case "dashboard":
      return <DashboardIcon size={size} />;
    case "tasks":
      return <CheckCircleIcon size={size} />;
    case "kpi":
      return <BarChartIcon size={size} />;
    case "reports":
      return <ReportsIcon size={size} />;
    case "members":
      return <ContactsIcon size={size} />;
    case "teams":
      return <ShareNetworkIcon size={size} />;
    case "admins":
      return <ShieldCheckIcon size={size} />;
    case "contacts":
      return <MailIcon size={size} />;
    case "inventory":
      return <WorkspaceIcon size={size} />;
    case "documents":
      return <DocumentsIcon size={size} />;
    case "todos":
      return <TodoIcon size={size} />;
    case "history":
    case "activity":
      return <HistoryIcon size={size} />;
    default:
      return <WorkspaceIcon size={size} />;
  }
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTabId,
  className,
  onTabChange,
  onSearchClick,
}) => {
  const { viewer, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const navCenterRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentUser = {
    name: profile?.name || viewer?.userId || USER_PROFILE_DATA.name,
    email: profile?.email || viewer?.userId || "Authenticated user",
    roleLabel: getRoleLabel(viewer?.role ?? null),
    avatarUrl: USER_PROFILE_DATA.avatarUrl,
  };

  // Determine active tab from pathname or activeTabId prop
  const currentTabId = (() => {
    if (activeTabId && activeTabId !== "dashboard") return activeTabId;
    if (!pathname || pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname.startsWith("/kpi")) return "kpi";
    if (pathname.startsWith("/reports")) return "reports";
    if (pathname.startsWith("/inventory")) return "inventory";
    if (pathname.startsWith("/documents")) return "documents";
    if (pathname.startsWith("/todos")) return "todos";
    if (pathname.startsWith("/tasks") || pathname.startsWith("/submissions")) return "tasks";
    if (pathname.startsWith("/members")) return "members";
    if (pathname.startsWith("/teams")) return "teams";
    if (pathname.startsWith("/admins")) return "admins";
    if (pathname.startsWith("/activity") || pathname.startsWith("/history")) return "history";
    if (pathname.startsWith("/contacts")) return "contacts";
    return activeTabId || "dashboard";
  })();

  // Filter primary tabs and grouped dropdowns by role permissions
  const visiblePrimaryTabs = TOP_NAV_PRIMARY_TABS.filter((tab) =>
    canSeeNavigationItem(viewer, tab.id)
  );

  const visibleGroups = TOP_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canSeeNavigationItem(viewer, item.id)),
  })).filter((group) => group.items.length > 0);

  const allVisibleTabs = TOP_NAV_TABS.filter((tab) =>
    canSeeNavigationItem(viewer, tab.id)
  );

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const closeDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // Handle outside clicks for dropdowns and profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (navCenterRef.current && !navCenterRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsMobileNavOpen(false);
        setActiveDropdown(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on route transition without cascading re-renders
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileNavOpen(false);
    setActiveDropdown(null);
  }

  const handleDropdownToggle = (groupId: string) => {
    setActiveDropdown((prev) => (prev === groupId ? null : groupId));
  };

  const handleLogout = () => {
    setLogoutError(null);
    void signOut()
      .then(() => {
        router.replace("/");
      })
      .catch((error: unknown) => {
        setLogoutError(
          error instanceof Error ? error.message : "Unable to log out. Please try again."
        );
      });
  };

  const navbarClassName = className ? `${styles.navbar} ${className}` : styles.navbar;

  return (
    <header className={navbarClassName}>
      {/* Brand / Logo Section */}
      <Link href="/dashboard" className={styles.leftSection} style={{ textDecoration: "none" }}>
        <div className={styles.logoIcon}>
          <LogoIcon size={30} />
        </div>
        <span className={styles.brandName}>{APP_STRINGS.appName}</span>
      </Link>

      {/* Main Desktop Navigation */}
      <nav
        ref={navCenterRef}
        className={styles.centerSection}
        aria-label={APP_STRINGS.ariaLabels.topNavigation}
      >
        <div className={styles.navTabs}>
          {/* Primary Top Links */}
          {visiblePrimaryTabs.map((tab) => {
            const isActive = tab.id === currentTabId;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                onClick={() => {
                  closeDropdowns();
                  onTabChange?.(tab.id);
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
              </Link>
            );
          })}

          {/* Grouped Dropdown Menus */}
          {visibleGroups.map((group) => {
            const isGroupActive = group.items.some((item) => item.id === currentTabId);
            const isDropdownOpen = activeDropdown === group.id;
            const activeItem = group.items.find((item) => item.id === currentTabId);

            return (
              <div key={group.id} className={styles.dropdownContainer}>
                <button
                  type="button"
                  className={`${styles.dropdownTrigger} ${
                    isGroupActive ? styles.activeDropdown : ""
                  } ${isDropdownOpen ? styles.dropdownOpen : ""}`}
                  onClick={() => handleDropdownToggle(group.id)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                  aria-label={
                    group.id === "people"
                      ? APP_STRINGS.ariaLabels.peopleDropdown
                      : APP_STRINGS.ariaLabels.operationsDropdown
                  }
                >
                  <span className={styles.dropdownTriggerText}>
                    {group.label}
                    {activeItem && <span className={styles.activePillDot} />}
                  </span>
                  <ChevronDownIcon
                    size={13}
                    className={`${styles.dropdownChevron} ${
                      isDropdownOpen ? styles.chevronRotated : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    className={styles.dropdownMenu}
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className={styles.dropdownMenuHeader}>
                      <span className={styles.dropdownSectionTitle}>{group.label}</span>
                    </div>

                    <div className={styles.dropdownMenuList}>
                      {group.items.map((item: NavItemDetail) => {
                        const isItemActive = item.id === currentTabId;
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            role="menuitem"
                            className={`${styles.dropdownMenuItem} ${
                              isItemActive ? styles.dropdownMenuItemActive : ""
                            }`}
                            onClick={() => {
                              closeDropdowns();
                              onTabChange?.(item.id);
                            }}
                          >
                            <div
                              className={`${styles.menuItemIconWrapper} ${
                                isItemActive ? styles.menuItemIconWrapperActive : ""
                              }`}
                            >
                              {getNavIcon(item.id, 16)}
                            </div>
                            <div className={styles.menuItemContent}>
                              <div className={styles.menuItemTitleRow}>
                                <span className={styles.menuItemTitle}>{item.label}</span>
                                {isItemActive && (
                                  <span className={styles.menuItemActiveBadge}>Active</span>
                                )}
                              </div>
                              {item.description && (
                                <span className={styles.menuItemDescription}>
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Right Controls Section */}
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

        {/* User Profile Badge & Dropdown */}
        <div
          ref={menuRef}
          className={styles.avatarWrapper}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={APP_STRINGS.ariaLabels.userProfile}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsMenuOpen((prev) => !prev);
            }
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
                <span>{APP_STRINGS.actions.logout}</span>
              </button>
              {logoutError && (
                <div className={styles.dropdownEmail} role="alert">
                  {logoutError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={styles.hamburgerButton}
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
          aria-expanded={isMobileNavOpen}
          aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-nav-drawer"
        >
          <span
            className={`${styles.hamburgerLine} ${
              isMobileNavOpen ? styles.hamburgerLineOpen1 : ""
            }`}
          />
          <span
            className={`${styles.hamburgerLine} ${
              isMobileNavOpen ? styles.hamburgerLineOpen2 : ""
            }`}
          />
          <span
            className={`${styles.hamburgerLine} ${
              isMobileNavOpen ? styles.hamburgerLineOpen3 : ""
            }`}
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
              {allVisibleTabs.map((tab) => {
                const isActive = tab.id === currentTabId;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`${styles.mobileNavItem} ${
                      isActive ? styles.mobileNavActiveItem : ""
                    }`}
                    onClick={() => {
                      onTabChange?.(tab.id);
                      closeMobileNav();
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className={styles.mobileNavItemContent}>
                      <span className={styles.mobileNavIcon}>{getNavIcon(tab.id, 18)}</span>
                      <span>{tab.label}</span>
                    </div>
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
                <span>{APP_STRINGS.actions.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
