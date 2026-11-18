import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationItem } from "@/features/notifications/components/NotificationItem/NotificationItem";
import { NOTIFICATION_STRINGS } from "@/features/notifications/constants/notification-strings";
import type { OperixNotification } from "@/features/notifications/types/notification.types";

const buildNotification = (overrides: Partial<OperixNotification> = {}): OperixNotification => ({
  id: "notif-item-1",
  type: "TASK_ASSIGNED",
  title: "Task Assigned",
  body: "You have been assigned to Task #1",
  isRead: false,
  readAt: null,
  resolvedAt: null,
  resolution: null,
  actionState: "ACTIONABLE",
  targetType: "TASK",
  targetId: "task-1",
  actorId: "actor-1",
  actor: { id: "actor-1", name: "Admin User" },
  createdAt: "2026-09-30T10:00:00.000Z",
  ...overrides,
});

const mockNotification = buildNotification();

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

  it("opens the target only while the notification is actionable", () => {
    render(<NotificationItem notification={buildNotification()} />);

    expect(
      screen.getByRole("link", { name: NOTIFICATION_STRINGS.actions.openTarget }),
    ).toHaveAttribute("href", "/tasks/task-1");
    expect(screen.queryByText(NOTIFICATION_STRINGS.actions.completed)).not.toBeInTheDocument();
  });

  it("replaces the action with a completed state once the job is resolved", () => {
    render(
      <NotificationItem
        notification={buildNotification({
          targetType: "REGISTRATION_REQUEST",
          targetId: "request-public-id",
          actionState: "RESOLVED",
          resolvedAt: "2026-11-18T09:00:00.000Z",
          resolution: "APPROVED",
        })}
      />,
    );

    expect(
      screen.queryByRole("link", { name: NOTIFICATION_STRINGS.actions.openTarget }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(NOTIFICATION_STRINGS.actions.completed)).toBeInTheDocument();
  });

  it("keeps a resolved notification in history without pretending it is unread-free", () => {
    render(
      <NotificationItem
        notification={buildNotification({
          actionState: "RESOLVED",
          resolvedAt: "2026-11-18T09:00:00.000Z",
        })}
        onMarkRead={vi.fn()}
      />,
    );

    // Resolution must never collapse into the read flag.
    expect(
      screen.getByRole("button", { name: NOTIFICATION_STRINGS.aria.markNotificationRead }),
    ).toBeInTheDocument();
  });

  it("marks an unusable target as unavailable instead of offering navigation", () => {
    render(
      <NotificationItem
        notification={buildNotification({
          targetType: "REGISTRATION_REQUEST",
          targetId: null,
          actionState: "UNAVAILABLE",
        })}
      />,
    );

    expect(
      screen.queryByRole("link", { name: NOTIFICATION_STRINGS.actions.openTarget }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(NOTIFICATION_STRINGS.actions.targetUnavailable)).toBeInTheDocument();
  });

  it("renders no action affordance for notifications without a target", () => {
    render(
      <NotificationItem
        notification={buildNotification({
          type: "PASSWORD_RESET",
          targetType: null,
          targetId: null,
          actionState: "UNAVAILABLE",
        })}
      />,
    );

    expect(
      screen.queryByRole("link", { name: NOTIFICATION_STRINGS.actions.openTarget }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(NOTIFICATION_STRINGS.actions.targetUnavailable),
    ).not.toBeInTheDocument();
  });

  it("does not present the target as clickable while a mutation is in flight", () => {
    render(
      <NotificationItem
        notification={buildNotification()}
        deletingNotificationId={mockNotification.id}
        onDelete={vi.fn()}
      />,
    );

    const link = screen.getByRole("link", {
      name: NOTIFICATION_STRINGS.actions.openTarget,
    });

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
  });
});
