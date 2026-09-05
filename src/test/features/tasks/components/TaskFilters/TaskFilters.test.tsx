import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OperixViewer } from "@/types/auth";
import { DEFAULT_TASK_FILTERS } from "@/features/tasks/types/task.types";
import { TaskFilters } from "@/features/tasks/components/TaskFilters/TaskFilters";

vi.mock("@/features/tasks/components/TaskTeamPicker", () => ({
  TaskTeamPicker: () => <div>Team picker</div>,
}));

vi.mock("@/features/tasks/components/TaskAssigneePicker", () => ({
  TaskAssigneePicker: () => <div>Member picker</div>,
}));

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

describe("TaskFilters", () => {
  it("shows Team and Member filters to SUPER_ADMIN", () => {
    render(
      <TaskFilters
        viewer={viewer("SUPER_ADMIN")}
        filters={DEFAULT_TASK_FILTERS}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("Team filter")).toBeInTheDocument();
    expect(screen.getByText("Assigned Member filter")).toBeInTheDocument();
  });

  it("hides Team filter from ADMIN but keeps assigned Member filter", () => {
    render(
      <TaskFilters
        viewer={viewer("ADMIN")}
        filters={DEFAULT_TASK_FILTERS}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.queryByText("Team filter")).not.toBeInTheDocument();
    expect(screen.getByText("Assigned Member filter")).toBeInTheDocument();
  });

  it("hides Team and assigned Member filters from MEMBER", () => {
    render(
      <TaskFilters
        viewer={viewer("MEMBER")}
        filters={DEFAULT_TASK_FILTERS}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.queryByText("Team filter")).not.toBeInTheDocument();
    expect(screen.queryByText("Assigned Member filter")).not.toBeInTheDocument();
  });

  it("applies search only when submitted", async () => {
    const onApply = vi.fn();
    render(
      <TaskFilters
        viewer={viewer("MEMBER")}
        filters={DEFAULT_TASK_FILTERS}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Reference, title, description"), {
      target: { value: "  report  " },
    });
    expect(onApply).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));
    expect(onApply).toHaveBeenCalledWith({
      ...DEFAULT_TASK_FILTERS,
      q: "report",
    });
  });
});
