"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { notificationApi } from "../../api/notification.api";
import { useNotifications } from "../../hooks/use-notifications";
import { useUnreadNotificationCount } from "../../hooks/use-unread-notification-count";
import { getNotificationErrorMessage } from "../../notification-errors";
import type { OperixNotification } from "../../types/notification.types";
import { NotificationPopover } from "../NotificationPopover";
import styles from "./NotificationBell.module.css";

export interface NotificationBellProps {
  ariaLabel?: string;
  title?: string;
}

export const NotificationBell = ({
  ariaLabel = "View notifications",
  title,
}: NotificationBellProps) => {
  const { hydrationStatus } = useAuth();
  const enabled = hydrationStatus === "AUTHENTICATED";
  const { count, refresh: refreshCount } = useUnreadNotificationCount(enabled);
  const {
    notifications,
    loading,
    error,
    refresh: refreshPreview,
  } = useNotifications(1, 5, enabled);
  const [isOpen, setIsOpen] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<Error | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && enabled) {
      void refreshCount();
      void refreshPreview();
    }
  };

  const handleMarkRead = async (notification: OperixNotification) => {
    if (markingNotificationId || notification.isRead) return;
    setMarkingNotificationId(notification.id);
    setMutationError(null);
    try {
      await notificationApi.markRead(notification.id);
    } catch (markError) {
      setMutationError(new Error(getNotificationErrorMessage(markError)));
    } finally {
      await Promise.all([refreshCount(), refreshPreview()]);
      setMarkingNotificationId(null);
    }
  };

  const displayCount = count > 99 ? "99+" : String(count);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.button}
        aria-label={count > 0 ? `${ariaLabel}. ${count} unread.` : ariaLabel}
        title={title}
        onClick={handleOpen}
      >
        <BellIcon size={18} />
        {enabled && count > 0 && <span className={styles.badge}>{displayCount}</span>}
      </button>
      {isOpen && (
        <NotificationPopover
          notifications={notifications}
          loading={loading}
          error={mutationError ?? error}
          markingNotificationId={markingNotificationId}
          onMarkRead={(notification) => void handleMarkRead(notification)}
        />
      )}
    </div>
  );
};
