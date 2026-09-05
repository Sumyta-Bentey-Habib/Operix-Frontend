import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";
import { TaskCreatePage } from "@/features/tasks/components/TaskCreatePage";
import { taskApi } from "@/features/tasks/api/task.api";
import type { Team } from "@/features/teams";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

const mockTeam: Team = {
  id: "team-123",
  name: "Engineering Alpha",
  adminId: "adm-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

vi.mock("@/features/tasks/components/TaskTeamPicker", () => ({
  TaskTeamPicker: ({
    onSelect,
    selectedTeam,
  }: {
    onSelect: (team: Team) => void;
    selectedTeam?: Team | null;
  }) => (
    <div>
      <span data-testid="selected-team">{selectedTeam?.name ?? "No team selected"}</span>
      <button type="button" onClick={() => onSelect(mockTeam)}>
        Select Team Alpha
      </button>
    </div>
  ),
}));

describe("TaskCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders breadcrumbs, back button, headers, and form sections", () => {
    render(<TaskCreatePage />);

    expect(screen.getByText(TASK_CREATE_STRINGS.breadcrumbs.dashboard)).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.breadcrumbs.tasks)).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.breadcrumbs.current)).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.navigation.backToTasks)).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.eyebrow)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: TASK_CREATE_STRINGS.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.sections.generalInfo)).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.sections.configuration)).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.sections.guidelines)).toBeInTheDocument();
  });

  it("validates that title is required", async () => {
    render(<TaskCreatePage />);

    const submitBtn = screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(TASK_CREATE_STRINGS.validation.titleRequired),
    ).toBeInTheDocument();
  });

  it("validates that team selection is required", async () => {
    render(<TaskCreatePage />);

    const titleInput = screen.getByPlaceholderText(TASK_CREATE_STRINGS.fields.titlePlaceholder);
    fireEvent.change(titleInput, { target: { value: "Implement new feature" } });

    const submitBtn = screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(TASK_CREATE_STRINGS.validation.teamRequired),
    ).toBeInTheDocument();
  });

  it("allows selecting priority and submits successfully when valid", async () => {
    vi.spyOn(taskApi, "create").mockResolvedValueOnce({
      id: "task-999",
      referenceCode: "TSK-0999",
      title: "Implement new feature",
      description: "Feature details",
      remarks: "Important notes",
      priority: "HIGH",
      status: "PENDING",
      dueAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      teamId: "team-123",
      categoryId: null,
      createdById: "admin-1",
      createdAt: "2026-09-05T00:00:00.000Z",
      updatedAt: "2026-09-05T00:00:00.000Z",
      isOverdue: false,
    });

    render(<TaskCreatePage />);

    const titleInput = screen.getByPlaceholderText(TASK_CREATE_STRINGS.fields.titlePlaceholder);
    fireEvent.change(titleInput, { target: { value: "Implement new feature" } });

    const descInput = screen.getByPlaceholderText(
      TASK_CREATE_STRINGS.fields.descriptionPlaceholder,
    );
    fireEvent.change(descInput, { target: { value: "Feature details" } });

    const remarksInput = screen.getByPlaceholderText(TASK_CREATE_STRINGS.fields.remarksPlaceholder);
    fireEvent.change(remarksInput, { target: { value: "Important notes" } });

    // Select Priority: HIGH
    const highPriorityBtn = screen.getByRole("radio", {
      name: TASK_CREATE_STRINGS.priorities.HIGH.label,
    });
    fireEvent.click(highPriorityBtn);

    // Select Team
    const selectTeamBtn = screen.getByText("Select Team Alpha");
    fireEvent.click(selectTeamBtn);

    // Submit
    const submitBtn = screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(taskApi.create).toHaveBeenCalledWith({
        title: "Implement new feature",
        description: "Feature details",
        remarks: "Important notes",
        priority: "HIGH",
        teamId: "team-123",
      });
      expect(mockReplace).toHaveBeenCalledWith("/tasks/task-999");
    });
  });

  it("navigates back to tasks list when cancel is clicked", () => {
    render(<TaskCreatePage />);

    const cancelBtn = screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.cancel });
    fireEvent.click(cancelBtn);

    expect(mockPush).toHaveBeenCalledWith("/tasks");
  });
});
