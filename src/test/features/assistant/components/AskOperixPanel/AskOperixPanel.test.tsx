import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AskOperixPanel } from "@/features/assistant";

const mocks = vi.hoisted(() => ({ ask: vi.fn(), cancel: vi.fn(), response: null as unknown }));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    viewer: {
      userId: "member-1",
      role: "MEMBER",
      status: "ACTIVE",
      scope: { type: "MEMBER", teamId: "team-1" },
    },
  }),
}));
vi.mock("@/features/assistant/hooks/use-ask-operix", () => ({
  useAskOperix: () => ({
    response: mocks.response,
    pending: false,
    error: null,
    ask: mocks.ask,
    cancel: mocks.cancel,
  }),
}));

describe("AskOperixPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.response = null;
  });

  it("renders for an authenticated Member without querying automatically", () => {
    render(<AskOperixPanel open onClose={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "Ask Operix" })).toBeInTheDocument();
    expect(screen.getByText("What overdue Tasks do I have?")).toBeInTheDocument();
    expect(mocks.ask).not.toHaveBeenCalled();
  });

  it("submits the explicit question", () => {
    render(<AskOperixPanel open onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Operational question"), {
      target: { value: "Show my urgent Tasks" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));
    expect(mocks.ask).toHaveBeenCalledWith("Show my urgent Tasks");
  });

  it("cancels work when closed", () => {
    const { rerender } = render(<AskOperixPanel open onClose={vi.fn()} />);
    rerender(<AskOperixPanel open={false} onClose={vi.fn()} />);
    expect(mocks.cancel).toHaveBeenCalled();
  });

  it("renders server owned Task links and operations metadata", () => {
    mocks.response = {
      status: "ANSWERED",
      answer: "Review the matching Task.",
      clarification: null,
      highlights: ["One Task matched."],
      references: {
        tasks: [
          {
            id: "task-public",
            referenceCode: "TASK-10",
            title: "Prepare report",
            status: "IN_PROGRESS",
            priority: "HIGH",
            dueAt: null,
          },
        ],
        operations: { days: 7, asOf: "2026-10-24T08:00:00.000Z" },
      },
      confidence: "HIGH",
      limitations: ["Current authorized data only."],
      meta: { provider: "gemini", model: "test", attempts: 2, latencyMs: 3, intent: "TASK_QUERY" },
    };
    render(<AskOperixPanel open onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: "View Task" })).toHaveAttribute(
      "href",
      "/tasks/task-public",
    );
    expect(screen.getByText(/7 day view/)).toBeInTheDocument();
    expect(screen.getByText("Current authorized data only.")).toBeInTheDocument();
  });
});
