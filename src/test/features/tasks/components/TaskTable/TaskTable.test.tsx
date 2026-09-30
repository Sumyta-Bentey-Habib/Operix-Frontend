import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OperixViewer } from "@/types/auth";
import type { Task } from "@/features/tasks/types/task.types";
import { TaskTable } from "@/features/tasks/components/TaskTable/TaskTable";

const viewer = (role: OperixViewer["role"]): OperixViewer => ({
  userId: `${role.toLowerCase()}-1`,
  role,
  status: "ACTIVE",
  scope:
    role === "SUPER_ADMIN"
      ? { type: "GLOBAL" }
      : role === "ADMIN"
        ? { type: "ADMIN", teamIds: ["team-1"] }
        : { type: "MEMBER", teamId: "team-1" },
});

const task = (status: Task["status"], isOverdue = false): Task => ({
  id: "task-1",
  referenceCode: "TSK-0001",
  title: "Prepare monthly report",
  description: null,
  remarks: null,
  priority: "HIGH",
  status,
  dueAt: "2026-01-01T00:00:00.000Z",
  startedAt: null,
  completedAt: null,
  cancelledAt: null,
  teamId: "team-1",
  categoryId: null,
  createdById: "admin-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  isOverdue,
});

describe("TaskTable", () => {
  it("shows SUPER_ADMIN assign action for PENDING tasks", () => {
    render(
      <TaskTable
        tasks={[task("PENDING")]}
        viewer={viewer("SUPER_ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assign" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
  });

  it("shows MEMBER claim action for PENDING tasks with allowSelfClaim", () => {
    const claimFn = vi.fn();
    render(
      <TaskTable
        tasks={[{ ...task("PENDING"), allowSelfClaim: true }]}
        viewer={viewer("MEMBER")}
        onAssign={vi.fn()}
        onClaim={claimFn}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Claim" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Claim" }));
    expect(claimFn).toHaveBeenCalled();
  });

  it("shows ADMIN assign only for PENDING Tasks", () => {
    render(
      <TaskTable
        tasks={[task("PENDING"), { ...task("ASSIGNED"), id: "task-2", referenceCode: "TSK-0002" }]}
        viewer={viewer("ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Assign" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
  });

  it("shows MEMBER start only for ASSIGNED Tasks where they are responsible", () => {
    const memberViewer = viewer("MEMBER"); // userId: "member-1"
    render(
      <TaskTable
        tasks={[
          // ASSIGNED task where member is the responsible user
          {
            ...task("ASSIGNED"),
            responsible: { id: "member-1", name: "Test Member", role: "MEMBER" },
          },
          // IN_PROGRESS task - no Start button regardless
          { ...task("IN_PROGRESS"), id: "task-2", referenceCode: "TSK-0002" },
        ]}
        viewer={memberViewer}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Start" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Assign" })).not.toBeInTheDocument();
  });

  it("uses backend isOverdue instead of recalculating from dueAt", () => {
    render(
      <TaskTable
        tasks={[task("COMPLETED", false)]}
        viewer={viewer("SUPER_ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.queryByText("Overdue", { selector: "span" })).not.toBeInTheDocument();
  });

  it("displays assigned member and creator info when available", () => {
    const assignedTask: Task = {
      ...task("ASSIGNED"),
      owner: {
        id: "creator-uuid",
        name: "Super Boss",
        role: "SUPER_ADMIN",
      },
      responsible: {
        id: "member-uuid",
        name: "Alex Dev",
        role: "MEMBER",
        designation: "Senior Engineer",
      },
      team: {
        id: "team-uuid",
        name: "Frontend Core",
      },
    };

    render(
      <TaskTable
        tasks={[assignedTask]}
        viewer={viewer("SUPER_ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText("Alex Dev")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Super Boss")).toBeInTheDocument();
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
    expect(screen.getByText("Frontend Core")).toBeInTheDocument();
  });

  it("displays Unassigned badge when task has no assigned member", () => {
    const unassignedTask: Task = {
      ...task("PENDING"),
      responsible: null,
    };

    render(
      <TaskTable
        tasks={[unassignedTask]}
        viewer={viewer("SUPER_ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("renders Global badge for global tasks without a team", () => {
    const globalTask: Task = {
      ...task("PENDING"),
      id: "task-global-1",
      referenceCode: "TSK-G001",
      title: "Global Compliance Notice",
      scope: "GLOBAL",
      teamId: null,
      team: null,
    };

    render(
      <TaskTable
        tasks={[globalTask]}
        viewer={viewer("SUPER_ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText("Global")).toBeInTheDocument();
    expect(screen.getByText("Global Compliance Notice")).toBeInTheDocument();
  });

  it("renders Recurring badge with correct frequency label for recurring tasks", () => {
    const weeklyTask: Task = {
      ...task("PENDING"),
      id: "task-rec-1",
      title: "Weekly Sync Review",
      recurrence: {
        id: "rec-1",
        frequency: "WEEKLY",
        nextOccurrenceAt: "2026-01-08T00:00:00.000Z",
        reminderLeadMinutes: 60,
        distributionLeadMinutes: null,
        isActive: true,
      },
    };

    const monthlyTask: Task = {
      ...task("PENDING"),
      id: "task-rec-2",
      title: "Monthly Security Audit",
      recurrence: {
        id: "rec-2",
        frequency: "MONTHLY",
        nextOccurrenceAt: "2026-02-01T00:00:00.000Z",
        reminderLeadMinutes: 120,
        distributionLeadMinutes: null,
        isActive: true,
      },
    };

    const nonRecurringTask: Task = {
      ...task("PENDING"),
      id: "task-non-rec",
      title: "One-off Task",
      recurrence: null,
    };

    render(
      <TaskTable
        tasks={[weeklyTask, monthlyTask, nonRecurringTask]}
        viewer={viewer("SUPER_ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText("Weekly Recurring")).toBeInTheDocument();
    expect(screen.getByText("Monthly Recurring")).toBeInTheDocument();
    expect(screen.getByTitle("Recurring weekly task")).toBeInTheDocument();
    expect(screen.getByTitle("Recurring monthly task")).toBeInTheDocument();
  });
});
