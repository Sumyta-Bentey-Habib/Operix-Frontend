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

const admin: OperixViewer = {
  userId: "admin-1",
  role: "ADMIN",
  status: "ACTIVE",
  scope: { type: "ADMIN", teamIds: ["team-1"] },
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

const deferred = <TValue,>() => {
  let resolve!: (value: TValue) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<TValue>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

const renderForm = (viewer: OperixViewer = superAdmin, onSubmit = vi.fn()) => {
  render(<TaskForm pending={false} error={null} viewer={viewer} onSubmit={onSubmit} />);

  return onSubmit;
};

const typePrompt = (value = promptText) => {
  fireEvent.change(screen.getByLabelText(TASK_CREATE_STRINGS.ai.promptLabel), {
    target: { value },
  });
};

const clickGenerate = () => {
  fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.generate }));
};

const typeTitle = (value: string) => {
  fireEvent.change(screen.getByLabelText(/task title/i), { target: { value } });
};

const toExpectedDueAt = (iso: string) => {
  const instant = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(
    instant.getDate(),
  )}T${pad(instant.getHours())}:${pad(instant.getMinutes())}`;
};

beforeEach(() => {
  mocks.create.mockReset();
  mocks.generateAiDraft.mockReset();
});

describe("TaskForm AI generate and fill", () => {
  it("exposes the action to allowed roles and never calls the API on mount", () => {
    renderForm(admin);

    expect(
      screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.generate }),
    ).toBeInTheDocument();
    expect(mocks.generateAiDraft).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("hides AI assistance from Members", () => {
    renderForm({
      userId: "member-1",
      role: "MEMBER",
      status: "ACTIVE",
      scope: { type: "MEMBER", teamId: "team-1" },
    });

    expect(
      screen.queryByRole("button", { name: TASK_CREATE_STRINGS.ai.generate }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(TASK_CREATE_STRINGS.ai.promptLabel)).not.toBeInTheDocument();
  });

  it("posts the trimmed prompt to the AI draft endpoint with an abort signal", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    renderForm();

    typePrompt(`   ${promptText}   `);
    clickGenerate();

    await waitFor(() =>
      expect(mocks.generateAiDraft).toHaveBeenCalledWith(
        { prompt: promptText },
        { signal: expect.any(AbortSignal) as AbortSignal },
      ),
    );
  });

  it("fills the supported fields immediately without an apply step", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    const onSubmit = renderForm();

    typePrompt();
    clickGenerate();

    await waitFor(() => expect(screen.getByLabelText(/task title/i)).toHaveValue(draft.title));

    expect(screen.getByLabelText(/^description$/i)).toHaveValue(draft.description);
    expect(
      screen.getByRole("radio", { name: TASK_CREATE_STRINGS.priorities.HIGH.label }),
    ).toBeChecked();
    expect(screen.getByLabelText(TASK_CREATE_STRINGS.fields.dueAtAriaLabel)).toHaveValue(
      toExpectedDueAt(draft.suggestedDueAt as string),
    );
    expect(screen.getByRole("status")).toHaveTextContent(TASK_CREATE_STRINGS.ai.filled);

    // Filling fields is not creating the Task.
    expect(onSubmit).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("fills completion mode only when the form allows it", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);

    render(<TaskForm pending={false} error={null} viewer={superAdmin} onSubmit={vi.fn()} />);

    // Recurring tasks hide the selector and are always DIRECT.
    fireEvent.click(screen.getByRole("radio", { name: TASK_CREATE_STRINGS.recurrence.modeWeekly }));
    typePrompt();
    clickGenerate();

    await waitFor(() => expect(screen.getByLabelText(/task title/i)).toHaveValue(draft.title));

    expect(
      screen.queryByRole("radiogroup", {
        name: TASK_CREATE_STRINGS.completionMode.sectionLabel,
      }),
    ).not.toBeInTheDocument();
  });

  it("preserves human assignment choices across a fill", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    const onBulkSubmit = vi.fn();
    render(
      <TaskForm
        pending={false}
        error={null}
        viewer={superAdmin}
        onSubmit={vi.fn()}
        onBulkSubmit={onBulkSubmit}
      />,
    );

    // Everyone + Team + team + monthly recurrence chosen before asking AI.
    fireEvent.click(screen.getByRole("radio", { name: "Everyone" }));
    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    fireEvent.click(
      screen.getByRole("radio", { name: TASK_CREATE_STRINGS.recurrence.modeMonthly }),
    );

    typePrompt();
    clickGenerate();

    await waitFor(() => expect(screen.getByLabelText(/task title/i)).toHaveValue(draft.title));

    expect(screen.getByRole("radio", { name: "Everyone" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: TASK_CREATE_STRINGS.recurrence.modeMonthly }),
    ).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onBulkSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: draft.title,
        scope: "TEAM",
        teamId: "team-1",
        recurrence: expect.objectContaining({ frequency: "MONTHLY" }),
      }),
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("preserves a manually selected responsible member across a fill", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    // Recurring Team Tasks require a responsible member, which exposes the picker.
    fireEvent.click(screen.getByRole("radio", { name: TASK_CREATE_STRINGS.recurrence.modeWeekly }));
    fireEvent.click(screen.getByRole("button", { name: "Select Member One" }));
    typePrompt();
    clickGenerate();

    await waitFor(() => expect(screen.getByLabelText(/task title/i)).toHaveValue(draft.title));

    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ responsibleUserId: "member-1" }),
    );
  });

  it("restores the exact pre-AI values on undo", async () => {
    mocks.generateAiDraft.mockResolvedValue(draft);
    renderForm();

    typeTitle("Human typed title");
    fireEvent.click(screen.getByRole("radio", { name: TASK_CREATE_STRINGS.priorities.LOW.label }));

    typePrompt();
    clickGenerate();

    await waitFor(() => expect(screen.getByLabelText(/task title/i)).toHaveValue(draft.title));

    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.ai.undo }));

    expect(screen.getByLabelText(/task title/i)).toHaveValue("Human typed title");
    expect(
      screen.getByRole("radio", { name: TASK_CREATE_STRINGS.priorities.LOW.label }),
    ).toBeChecked();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("uses the latest generation and ignores a stale response", async () => {
    const first = deferred<TaskAiDraft>();
    const second = deferred<TaskAiDraft>();
    mocks.generateAiDraft.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    renderForm();

    typePrompt();
    clickGenerate();
    typePrompt("Create a monthly stock review task for the pharmacy team");
    clickGenerate();

    second.resolve({ ...draft, title: "Second generation title" });
    await waitFor(() =>
      expect(screen.getByLabelText(/task title/i)).toHaveValue("Second generation title"),
    );

    first.resolve({ ...draft, title: "Stale generation title" });
    await Promise.resolve();

    expect(screen.getByLabelText(/task title/i)).toHaveValue("Second generation title");
  });

  it("keeps the form untouched when the AI request fails", async () => {
    mocks.generateAiDraft.mockRejectedValue(
      new OperixApiError("provider unavailable", {
        status: 503,
        code: "AI_PROVIDER_UNAVAILABLE",
      }),
    );
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    typeTitle("Manual task");

    typePrompt();
    clickGenerate();

    expect(await screen.findByRole("alert")).toHaveTextContent(/ai service is unavailable/i);
    expect(screen.getByLabelText(/task title/i)).toHaveValue("Manual task");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Manual task", teamId: "team-1" }),
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("does not call the AI endpoint before the prompt reaches the minimum length", () => {
    renderForm();

    const generateButton = screen.getByRole("button", {
      name: TASK_CREATE_STRINGS.ai.generate,
    });

    expect(generateButton).toBeDisabled();

    typePrompt("   too short   ");

    expect(generateButton).toBeDisabled();
    expect(mocks.generateAiDraft).not.toHaveBeenCalled();
  });
});

describe("TaskForm completion mode", () => {
  it("defaults one-time Team tasks to review required", () => {
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    typeTitle("Prepare the monthly report");
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
    typeTitle("Prepare the monthly report");
    fireEvent.click(screen.getByRole("radio", { name: TASK_CREATE_STRINGS.completionMode.direct }));
    fireEvent.click(screen.getByRole("button", { name: TASK_CREATE_STRINGS.actions.submit }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "TEAM", completionMode: "DIRECT" }),
    );
  });

  it("hides the selector and forces direct completion for recurring tasks", () => {
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Select Team One" }));
    typeTitle("Weekly stock audit");
    fireEvent.click(screen.getByRole("radio", { name: TASK_CREATE_STRINGS.recurrence.modeWeekly }));

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
