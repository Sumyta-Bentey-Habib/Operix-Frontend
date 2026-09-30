const STORAGE_KEY_PREFIX = "operix_deleted_notifications_";
export const NOTIFICATIONS_CHANGED_EVENT = "operix_notifications_changed";
const MAX_STORED_DELETED_IDS = 1000;

// In-memory fallback in case localStorage is disabled or throws
const inMemoryDeletedIds = new Map<string, Set<string>>();

const getStorageKey = (userId?: string | null): string => {
  return `${STORAGE_KEY_PREFIX}${userId || "anonymous"}`;
};

export const dispatchNotificationChangedEvent = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
  }
};

export const getDeletedNotificationIds = (userId?: string | null): Set<string> => {
  const key = getStorageKey(userId);

  if (typeof window === "undefined") {
    return inMemoryDeletedIds.get(key) ?? new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return inMemoryDeletedIds.get(key) ?? new Set<string>();
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set<string>(parsed.filter((id): id is string => typeof id === "string"));
    }
    return new Set<string>();
  } catch {
    return inMemoryDeletedIds.get(key) ?? new Set<string>();
  }
};

const saveDeletedNotificationIds = (userId: string | null | undefined, ids: Set<string>): void => {
  const key = getStorageKey(userId);
  inMemoryDeletedIds.set(key, ids);

  if (typeof window === "undefined") {
    return;
  }

  try {
    // Keep most recent MAX_STORED_DELETED_IDS to prevent unbounded localStorage growth
    const arrayIds = Array.from(ids);
    const trimmed =
      arrayIds.length > MAX_STORED_DELETED_IDS
        ? arrayIds.slice(arrayIds.length - MAX_STORED_DELETED_IDS)
        : arrayIds;

    window.localStorage.setItem(key, JSON.stringify(trimmed));
  } catch {
    // Silently fall back to inMemory store if localStorage throws (e.g. quota, private browsing)
  }
};

export const addDeletedNotificationId = (
  userId: string | null | undefined,
  notificationId: string,
): void => {
  if (!notificationId) return;
  const current = getDeletedNotificationIds(userId);
  if (!current.has(notificationId)) {
    current.add(notificationId);
    saveDeletedNotificationIds(userId, current);
    dispatchNotificationChangedEvent();
  }
};

export const addDeletedNotificationIds = (
  userId: string | null | undefined,
  notificationIds: string[],
): void => {
  if (!notificationIds || notificationIds.length === 0) return;
  const current = getDeletedNotificationIds(userId);
  let changed = false;

  for (const id of notificationIds) {
    if (id && !current.has(id)) {
      current.add(id);
      changed = true;
    }
  }

  if (changed) {
    saveDeletedNotificationIds(userId, current);
    dispatchNotificationChangedEvent();
  }
};

export const isNotificationDeleted = (
  userId: string | null | undefined,
  notificationId: string,
): boolean => {
  if (!notificationId) return false;
  return getDeletedNotificationIds(userId).has(notificationId);
};

export const clearAllDeletedNotificationIds = (userId?: string | null): void => {
  const key = getStorageKey(userId);
  inMemoryDeletedIds.delete(key);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
      dispatchNotificationChangedEvent();
    } catch {
      // Ignored
    }
  }
};
