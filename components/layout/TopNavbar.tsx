"use client";

import React from "react";
import Image from "next/image";
import styles from "./TopNavbar.module.css";
import { LogoIcon, SearchIcon, BellIcon } from "@/components/icons";
import { TOP_NAV_TABS } from "@/constants/navigation";
import { USER_PROFILE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";

interface TopNavbarProps {
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTabId = "dashboard",
  onTabChange,
}) => {
  return (
    <header className={styles.navbar}>
      <div className={styles.leftSection}>
        <div className={styles.logoIcon}>
          <LogoIcon size={32} />
        </div>
        <span className={styles.brandName}>{APP_STRINGS.appName}</span>
      </div>

      <nav
        className={styles.centerSection}
        aria-label={APP_STRINGS.ariaLabels.topNavigation}
      >
        <div className={styles.navTabs}>
          {TOP_NAV_TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                onClick={() => onTabChange?.(tab.id)}
              >
                {tab.label}
              </button>
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
        >
          <SearchIcon size={18} />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label={APP_STRINGS.ariaLabels.notifications}
          title={APP_STRINGS.actions.notifications}
        >
          <BellIcon size={18} />
        </button>

        <div
          className={styles.avatarWrapper}
          aria-label={APP_STRINGS.ariaLabels.userProfile}
        >
          <Image
            src={USER_PROFILE_DATA.avatarUrl}
            alt={USER_PROFILE_DATA.name}
            width={38}
            height={38}
            className={styles.avatarImage}
            unoptimized
          />
        </div>
      </div>
    </header>
  );
};
