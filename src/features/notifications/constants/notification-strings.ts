export const NOTIFICATION_STRINGS = {
  header: {
    eyebrow: "Inbox",
    title: "Notifications",
    description:
      "Read the in-app workflow messages addressed to your account. Backend receiver scope is authoritative.",
  },
  popover: {
    title: "Notifications",
    viewAll: "View all notifications",
    empty: "No Notifications yet.",
    loading: "Loading Notifications...",
    ariaLabel: "Notification preview",
  },
  actions: {
    markAsRead: "Mark as read",
    markingAsRead: "Marking...",
    markAllAsRead: "Mark all read",
    markingAllAsRead: "Marking...",
    delete: "Delete",
    deleting: "Deleting...",
    clearAll: "Clear all",
    clearingAll: "Clearing...",
    openTarget: "Open target",
  },
  aria: {
    deleteNotification: "Delete notification",
    clearAllNotifications: "Clear all notifications",
    markNotificationRead: "Mark notification as read",
    markAllNotificationsRead: "Mark all notifications as read",
  },
  states: {
    emptyTitle: "No Notifications found",
    emptyMessage: "No Notifications match this view.",
    loading: "Loading Notifications...",
  },
  filters: {
    readStatusLabel: "Read status",
    all: "All",
    unread: "Unread",
    read: "Read",
    typeLabel: "Type",
    typePlaceholder: "Exact type, for example TASK_ASSIGNED",
    apply: "Apply",
    reset: "Reset",
  },
} as const;
