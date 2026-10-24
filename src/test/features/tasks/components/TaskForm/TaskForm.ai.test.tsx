import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import type { Member } from "@/features/members/types/member.types";
import type { TaskAiDraft } from "@/features/tasks/types/task.types";
import { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  generateAiDraft: vi.fn(),
}));

vi.mock("@/features/tasks/api/task.api", () => ({
  taskApi: {
    create: mocks.create,
    generateAiDraft: mocks.generateAiDraft,
  },
}));

vi.mock("@/features/tasks/components/TaskTeamPicker", () => ({
  TaskTeamPicker: ({ onSelect }: { onSelect: (team: unknown) => void }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: "team-1",
          name: "Pharmacy Operations",
          adminId: "admin-1",
          createdAt: "2026-10-01T00:00:00.000Z",
          updatedAt: "2026-10-01T00:00:00.000Z",
        })
      }
    >
      Select Team One
    </button>
  ),
}));

vi.mock("@/features/tasks/components/TaskAssigneePicker", () => ({
  TaskAssigneePicker: ({ onSelect }: { onSelect: (member: Member) => void }) => (
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
        } as unknown as Member)
      }
    >
      Select Member One
    </button>
  ),
}));

vi.mock("@/components/ui/DateTimePicker", () => ({
  DateTimePicker: ({ value, ariaLabel }: { value?: string; ariaLabel?: string }) => (
    <input aria-label={ariaLabel ?? "mock date"} value={value ?? ""} readOnly />
  ),
}));

const superAdmin: OperixViewer = {
  userId: "chief-1",
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  scope: { type: "GLOBAL" },
};

const draft: TaskAiDraft = {
  title: "Verify cold chain temperature logs",
  description: "Review last week's logs and flag every excursion above 8°C.",
  suggestedPriority: "HIGH",
  suggestedCompletionMode: "DIRECT",
  suggestedDueAt: "2026-11-02T09:00:00.000Z",
  reasoning: "The prompt describes a recurring compliance check.",
  meta: { model: "gemini-3.1-flash-lite", attempts: 1, latencyMs: 900 },
};

const promptText = "Verify the cold chain temperature logs from last week";

const renderForm = (onSubmit = vi.fn()) => {
  render(
    <TaskForm pending={false} error={null} viewer={superAdmin} onSubmit={onSubmit} />,
  );

  return onSubmit;
};

const generateDraft = async () => {
  fireEvent.change(screen.getByLabelText(TASK_CREATE_STRINGS.ai.promptLabel), {
    target: { value: promptText },
  });
  fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.generate }));

  await screen.findByText(draft.title);
};

beforeEach(() => {
  mocks.create.mockReset();
  mocks.generateAiDraft.mockReset();
});

describe("TaskForm AI draft generation", () => {
  it("generates a preview without creating or submitting a task", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    const onSubmit = renderForm();

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Human typed title" },
    });

    await generateDraft();

    expect(mocks.generateAiDraft).toHaveBeenCalledWith({ prompt: promptText });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/task title/i)).toHaveValue("Human typed title");
  });

  it("shows the advisory disclaimer and keeps the draft out of the form until applied", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    renderForm();

    await generateDraft();

    expect(screen.getByText(TASK_CREATE_STRINGS.ai.disclaimer)).toBeInTheDocument();
    expect(screen.getByText(TASK_CREATE_STRINGS.ai.badge)).toBeInTheDocument();
    expect(screen.getByText(draft.reasoning)).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toHaveValue("");
    expect(screen.getByLabelText(/^description$/i)).toHaveValue("");
  });

  it("does not call the AI endpoint before the prompt reaches the minimum length", () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    renderForm();

    const generateButton = screen.getByRole("button", {
      name: TASK_CREATE_STRINGS.ai.generate,
    });

    expect(generateButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(TASK_CREATE_STRINGS.ai.promptLabel), {
      target: { value: "   too short   " },
    });

    expect(generateButton).toBeDisabled();
    expect(mocks.generateAiDraft).not.toHaveBeenCalled();
  });

  it("keeps manual task creation working when the AI provider fails", async () => {
    mocks.generateAiDraft.mockRejectedValue(
      new OperixApiError("provider unavailable", {
        status: 503,
        code: "AI_PROVIDER_UNAVAILABLE",
      }),
    );
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Manual task" },
    });
    fireEvent.change(screen.getByLabelText(TASK_CREATE_STRINGS.ai.promptLabel), {
      target: { value: promptText },
    });
    expect(screen.getByLabelText(TASK_CREATE_STRINGS.ai.promptLabel)).toHaveValue(
      promptText,
    );
    expect(
      screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.generate }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.generate }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /the ai service is unavailable/i,
    );
    expect(
      screen.queryByRole("region", { name: TASK_CREATE_STRINGS.ai.previewTitle }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Manual task", teamId: "team-1" }),
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe("TaskForm apply draft", () => {
  it("copies the advisory draft into the form fields on demand", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    const onSubmit = renderForm();

    await generateDraft();
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.apply }));

    const instant = new Date(draft.suggestedDueAt as string);
    const pad = (value: number) => String(value).padStart(2, "0");
    const expectedDueAt = `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(
      instant.getDate(),
    )}T${pad(instant.getHours())}:${pad(instant.getMinutes())}`;

    expect(screen.getByLabelText(/task title/i)).toHaveValue(draft.title);
    expect(screen.getByLabelText(/^description$/i)).toHaveValue(draft.description);
    expect(
      screen.getByRole("radio", { name: TASK_CREATE_STRINGS.priorities.HIGH.label }),
    ).toBeChecked();
    expect(screen.getByLabelText(TASK_CREATE_STRINGS.fields.dueAtAriaLabel)).toHaveValue(
      expectedDueAt,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      TASK_CREATE_STRINGS.ai.applied,
    );
    expect(onSubmit).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("discards a preview without touching the form", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    renderForm();

    await generateDraft();
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.discard }));

    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: TASK_CREATE_STRINGS.ai.previewTitle }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/task title/i)).toHaveValue("");
  });
});

describe("TaskForm completion mode", () => {
  it("defaults one-time Team tasks to review required", () => {
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Prepare the monthly report" },
    });
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "TEAM",
        teamId: "team-1",
        completionMode: "REVIEW_REQUIRED",
      }),
    );
  });

  it("submits direct completion when the admin selects it", () => {
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Prepare the monthly report" },
    });
    fireEvent.click(
      screen.getByRole("radio", { name: TASK_CREATE_STRINGS.completionMode.direct }),
    );
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "TEAM", completionMode: "DIRECT" }),
    );
  });

  it("hides the selector and forces direct completion for recurring tasks", () => {
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Weekly stock audit" },
    });
    fireEvent.click(
      screen.getByRole("radio", { name: TASK_CREATE_STRINGS.recurrence.modeWeekly }),
    );

    expect(
      screen.queryByRole("radiogroup", {
        name: TASK_CREATE_STRINGS.completionMode.sectionLabel,
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select Member One" }));
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "TEAM",
        completionMode: "DIRECT",
        recurrence: expect.objectContaining({ frequency: "WEEKLY" }),
      }),
    );
  });
});
