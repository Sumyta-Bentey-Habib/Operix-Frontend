"use client";

import React from "react";
import styles from "./Sidebar.module.css";
import {
  DashboardIcon,
  DocumentsIcon,
  ReportsIcon,
  WorkspaceIcon,
  HistoryIcon,
  ContactsIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/components/icons";
import { SIDEBAR_NAV_ITEMS, SIDEBAR_LOGOUT_ITEM } from "@/constants/navigation";
import { APP_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";

export interface SidebarProps {
  activeId?: string;
  className?: string;
  onNavigate?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeId = "dashboard",
  className,
  onNavigate,
}) => {
  const { logout } = useAuth();

  const renderNavIcon = (iconName: string, isActive: boolean) => {
    const color = isActive ? "#059669" : "#6B7280";
    switch (iconName) {
      case "dashboard":
        return <DashboardIcon size={20} color={color} />;
      case "documents":
        return <DocumentsIcon size={20} color={color} />;
      case "reports":
        return <ReportsIcon size={20} color={color} />;
      case "workspace":
        return <WorkspaceIcon size={20} color={color} />;
      case "history":
        return <HistoryIcon size={20} color={color} />;
      case "contacts":
        return <ContactsIcon size={20} color={color} />;
      case "settings":
        return <SettingsIcon size={20} color={color} />;
      default:
        return <DashboardIcon size={20} color={color} />;
    }
  };

  const sidebarClassName = className ? `${styles.sidebar} ${className}` : styles.sidebar;

  return (
    <aside className={sidebarClassName} aria-label={APP_STRINGS.ariaLabels.mainNavigation}>
      <div className={styles.topGroup}>
        <button
          type="button"
          className={styles.actionButton}
          aria-label="Launcher"
          title="App Menu"
        >
          <div className={styles.actionButtonDotGrid}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </button>

        <nav className={styles.navList}>
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navButton} ${isActive ? styles.activeNavButton : ""}`}
                onClick={() => onNavigate?.(item.id)}
                aria-label={item.label}
                title={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {renderNavIcon(item.iconName, isActive)}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={styles.bottomGroup}>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={logout}
          aria-label={SIDEBAR_LOGOUT_ITEM.label}
          title={SIDEBAR_LOGOUT_ITEM.label}
        >
          <LogoutIcon size={20} />
        </button>
      </div>
    </aside>
  );
};
