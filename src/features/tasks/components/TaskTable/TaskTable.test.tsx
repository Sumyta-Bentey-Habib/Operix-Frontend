import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OperixViewer } from "@/types/auth";
import type { Task } from "../../types/task.types";
import { TaskTable } from "./TaskTable";

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
  it("shows SUPER_ADMIN read only actions", () => {
    render(
      <TaskTable
        tasks={[task("PENDING")]}
        viewer={viewer("SUPER_ADMIN")}
        onAssign={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "View" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Assign" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
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

  it("shows MEMBER start only for ASSIGNED Tasks", () => {
    render(
      <TaskTable
        tasks={[
          task("ASSIGNED"),
          { ...task("IN_PROGRESS"), id: "task-2", referenceCode: "TSK-0002" },
        ]}
        viewer={viewer("MEMBER")}
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
});
