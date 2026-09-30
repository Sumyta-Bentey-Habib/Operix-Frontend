import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationItem } from "@/features/notifications/components/NotificationItem/NotificationItem";
import { NOTIFICATION_STRINGS } from "@/features/notifications/constants/notification-strings";
import type { OperixNotification } from "@/features/notifications/types/notification.types";

const mockNotification: OperixNotification = {
  id: "notif-item-1",
  type: "TASK_ASSIGNED",
  title: "Task Assigned",
  body: "You have been assigned to Task #1",
  isRead: false,
  readAt: null,
  targetType: "TASK",
  targetId: "task-1",
  actorId: "actor-1",
  actor: { id: "actor-1", name: "Admin User" },
  createdAt: "2026-09-30T10:00:00.000Z",
};

describe("NotificationItem", () => {
  it("renders notification content and action buttons", () => {
    const onMarkRead = vi.fn();
    const onDelete = vi.fn();

    render(
      <NotificationItem
        notification={mockNotification}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByRole("heading", { name: "Task Assigned" })).toBeInTheDocument();
    expect(screen.getByText("You have been assigned to Task #1")).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", {
      name: NOTIFICATION_STRINGS.aria.deleteNotification,
    });
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockNotification);

    const markReadBtn = screen.getByRole("button", {
      name: NOTIFICATION_STRINGS.aria.markNotificationRead,
    });
    expect(markReadBtn).toBeInTheDocument();
    fireEvent.click(markReadBtn);
    expect(onMarkRead).toHaveBeenCalledWith(mockNotification);
  });

  it("shows deleting state when deletingNotificationId matches", () => {
    render(
      <NotificationItem
        notification={mockNotification}
        deletingNotificationId={mockNotification.id}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(NOTIFICATION_STRINGS.actions.deleting)).toBeInTheDocument();
    const deleteBtn = screen.getByRole("button", {
      name: NOTIFICATION_STRINGS.aria.deleteNotification,
    });
    expect(deleteBtn).toBeDisabled();
  });
});
