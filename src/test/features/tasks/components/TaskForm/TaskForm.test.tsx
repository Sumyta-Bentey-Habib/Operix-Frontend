import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import type { Member } from "@/features/members/types/member.types";
import type { OperixViewer } from "@/types/auth";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";

vi.mock("@/features/tasks/components/TaskTeamPicker", () => ({
  TaskTeamPicker: () => <div data-testid="team-picker" />,
}));

vi.mock("@/features/tasks/components/TaskAssigneePicker", () => ({
  TaskAssigneePicker: ({
    onSelect,
  }: {
    onSelect: (member: Member) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: "member-1",
          name: "Member One",
          role: "MEMBER",
          email: "member@example.com",
          employeeId: null,
          designation: null,
          status: "ACTIVE",
          createdAt: "2026-10-01T00:00:00.000Z",
          updatedAt: "2026-10-01T00:00:00.000Z",
        })
      }
    >
      Select Member One
    </button>
  ),
}));

vi.mock("@/components/ui/DateTimePicker", () => ({
  DateTimePicker: () => <input aria-label="mock date" />,
}));

const superAdmin: OperixViewer = {
  userId: "chief-1",
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  scope: { type: "GLOBAL" },
};

describe("TaskForm self claim policy", () => {
  it("sends allowSelfClaim true for a one time unassigned Global task", () => {
    const onSubmit = vi.fn();
    render(<TaskForm pending={false} error={null} viewer={superAdmin} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Open global work" },
    });
    fireEvent.click(screen.getByRole("radio", { name: TASK_CREATE_STRINGS.fields.scopeGlobal }));
    expect(screen.getByText(/open to all active members/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Open global work",
        scope: "GLOBAL",
        completionMode: "DIRECT",
        allowSelfClaim: true,
      }),
    );
  });

  it("turns Global self claim off when a Responsible user is selected", () => {
    const onSubmit = vi.fn();
    render(<TaskForm pending={false} error={null} viewer={superAdmin} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Assigned global work" },
    });
    fireEvent.click(screen.getByRole("radio", { name: TASK_CREATE_STRINGS.fields.scopeGlobal }));
    fireEvent.click(screen.getByRole("button", { name: "Select Member One" }));
    expect(
      screen.getByText(/disabled because this global task already has a responsible user/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Assigned global work",
        scope: "GLOBAL",
        responsibleUserId: "member-1",
        allowSelfClaim: false,
      }),
    );
  });
});
