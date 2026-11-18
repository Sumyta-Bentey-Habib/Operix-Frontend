import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskAssignmentDialog } from "@/features/tasks/components/TaskAssignmentDialog";
import type { Task, TaskAssignmentRecommendationResponse } from "@/features/tasks/types/task.types";

const mocks = vi.hoisted(() => ({
  generateAssignmentRecommendations: vi.fn(),
}));

vi.mock("@/features/tasks/api/task.api", () => ({
  taskApi: {
    generateAssignmentRecommendations: mocks.generateAssignmentRecommendations,
  },
}));

vi.mock("@/features/tasks/components/TaskAssigneePicker", () => ({
  TaskAssigneePicker: ({
    onSelect,
  }: {
    onSelect: (member: { id: string; name: string }) => void;
  }) => (
    <button type="button" onClick={() => onSelect({ id: "member-manual", name: "Manual Member" })}>
      Select Manual Member
    </button>
  ),
}));

const task = (id = "task-1"): Task => ({
  id,
  referenceCode: "TASK-20261024-0001",
  title: "Review inventory variance",
  description: null,
  remarks: null,
  priority: "HIGH",
  status: "PENDING",
  scope: "TEAM",
  dueAt: "2026-10-28T09:00:00.000Z",
  startedAt: null,
  completedAt: null,
  cancelledAt: null,
  categoryId: null,
  createdAt: "2026-10-24T00:00:00.000Z",
  updatedAt: "2026-10-24T00:00:00.000Z",
  isOverdue: false,
});

const result: TaskAssignmentRecommendationResponse = {
  taskId: "task-1",
  asOf: "2026-10-24T00:00:00.000Z",
  decision: "RECOMMEND",
  summary: "Member One has the lowest current workload among considered candidates.",
  recommendations: [
    {
      rank: 1,
      member: {
        id: "member-1",
        name: "Member One",
        designation: "Executive",
        teamName: "Operations",
      },
      metrics: {
        activeTasks: 1,
        overdueTasks: 0,
        activeUrgentTasks: 0,
        activeHighTasks: 1,
        completionRate: 92,
        onTimeRate: 88,
        averageCompletionMinutes: 180,
        relevantCategoryCompletedTasks: 4,
        relevantCategoryOnTimeTasks: 3,
      },
      rationale: "Low active workload and relevant completed work.",
      strengths: ["No overdue Tasks"],
      cautions: ["Schedules are not modeled"],
    },
  ],
  confidence: "MEDIUM",
  limitations: ["Schedules, leave, and capacity are not modeled."],
  meta: {
    provider: "gemini",
    model: "gemini-test",
    attempts: 1,
    latencyMs: 100,
    eligibleCandidates: 3,
    consideredCandidates: 3,
  },
};

beforeEach(() => {
  mocks.generateAssignmentRecommendations.mockReset();
});

describe("TaskAssignmentDialog", () => {
  it("generates only on demand and selecting a recommendation does not assign", async () => {
    mocks.generateAssignmentRecommendations.mockResolvedValue(result);
    const onSubmit = vi.fn();

    render(
      <TaskAssignmentDialog
        task={task()}
        pending={false}
        error={null}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    expect(mocks.generateAssignmentRecommendations).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/assignment note/i), {
      target: { value: "Keep this note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Recommendations" }));

    expect(await screen.findByText("Member One")).toBeInTheDocument();
    expect(mocks.generateAssignmentRecommendations).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Select Member" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/assignment note/i)).toHaveValue("Keep this note");

    fireEvent.click(screen.getByRole("button", { name: "Assign Task" }));
    expect(onSubmit).toHaveBeenCalledWith({
      responsibleUserId: "member-1",
      memberId: "member-1",
      note: "Keep this note",
    });
  });

  it("keeps the manual picker available when recommendation generation fails", async () => {
    mocks.generateAssignmentRecommendations.mockRejectedValue(new Error("provider unavailable"));
    const onSubmit = vi.fn();

    render(
      <TaskAssignmentDialog
        task={task()}
        pending={false}
        error={null}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Generate Recommendations" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "AI recommendations are temporarily unavailable. You can continue assigning this Task manually.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Select Manual Member" }));
    fireEvent.click(screen.getByRole("button", { name: "Assign Task" }));
    expect(onSubmit).toHaveBeenCalledWith({
      responsibleUserId: "member-manual",
      memberId: "member-manual",
    });
  });

  it("aborts and clears a stale recommendation request when the Task changes", async () => {
    let signal: AbortSignal | undefined;
    mocks.generateAssignmentRecommendations.mockImplementation(
      (_taskId: string, options?: { signal?: AbortSignal }) => {
        signal = options?.signal;
        return new Promise(() => undefined);
      },
    );

    const { rerender } = render(
      <TaskAssignmentDialog
        task={task("task-1")}
        pending={false}
        error={null}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Generate Recommendations" }));
    await waitFor(() => expect(signal).toBeDefined());

    rerender(
      <TaskAssignmentDialog
        task={task("task-2")}
        pending={false}
        error={null}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => expect(signal?.aborted).toBe(true));
    expect(screen.getByRole("button", { name: "Generate Recommendations" })).toBeEnabled();
  });
});
