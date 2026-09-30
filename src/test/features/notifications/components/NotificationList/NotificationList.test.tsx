import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationList } from "@/features/notifications/components/NotificationList/NotificationList";
import { NOTIFICATION_STRINGS } from "@/features/notifications/constants/notification-strings";
import { clearAllDeletedNotificationIds } from "@/features/notifications/utils/deleted-notifications-storage";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const mockNotifications = [
  {
    id: "notif-list-1",
    type: "TASK_ASSIGNED",
    title: "Task Assigned 1",
    body: "Body 1",
    isRead: false,
    readAt: null,
    targetType: "TASK",
    targetId: "task-1",
    actorId: "actor-1",
    actor: { id: "actor-1", name: "Admin User" },
    createdAt: "2026-09-30T10:00:00.000Z",
  },
  {
    id: "notif-list-2",
    type: "SYSTEM_ALERT",
    title: "System Alert 2",
    body: "Body 2",
    isRead: true,
    readAt: "2026-09-30T11:00:00.000Z",
    targetType: null,
    targetId: null,
    actorId: null,
    actor: null,
    createdAt: "2026-09-30T09:00:00.000Z",
  },
];

describe("NotificationList", () => {
  const userId = "list-test-user";

  beforeEach(() => {
    window.localStorage.clear();
    clearAllDeletedNotificationIds(userId);
    useAuthMock.mockReturnValue({
      viewer: { userId, role: "MEMBER", status: "ACTIVE", scope: { type: "MEMBER", teamId: null } },
      hydrationStatus: "AUTHENTICATED",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useAuthMock.mockReset();
  });

  it("renders notifications and allows deleting a notification locally", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/unread-count")) {
        return jsonResponse({ count: 1 });
      }
      if (url.includes("/notifications/notif-list-1/read")) {
        return jsonResponse({ id: "notif-list-1", isRead: true });
      }
      return jsonResponse({
        data: mockNotifications,
        meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
      });
    });

    render(<NotificationList />);

    expect(await screen.findByText("Task Assigned 1")).toBeInTheDocument();
    expect(screen.getByText("System Alert 2")).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole("button", {
      name: NOTIFICATION_STRINGS.aria.deleteNotification,
    });
    expect(deleteButtons).toHaveLength(2);

    // Delete first notification
    fireEvent.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(screen.queryByText("Task Assigned 1")).not.toBeInTheDocument();
    });
    expect(screen.getByText("System Alert 2")).toBeInTheDocument();
  });

  it("clears all visible notifications locally when Clear all is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/unread-count")) {
        return jsonResponse({ count: 1 });
      }
      if (url.includes("/read-all")) {
        return jsonResponse({ count: 1 });
      }
      return jsonResponse({
        data: mockNotifications,
        meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
      });
    });

    render(<NotificationList />);

    expect(await screen.findByText("Task Assigned 1")).toBeInTheDocument();

    const clearAllBtn = screen.getByRole("button", {
      name: NOTIFICATION_STRINGS.aria.clearAllNotifications,
    });
    fireEvent.click(clearAllBtn);

    await waitFor(() => {
      expect(screen.queryByText("Task Assigned 1")).not.toBeInTheDocument();
      expect(screen.queryByText("System Alert 2")).not.toBeInTheDocument();
      expect(screen.getByText(NOTIFICATION_STRINGS.states.emptyTitle)).toBeInTheDocument();
    });
  });
});
