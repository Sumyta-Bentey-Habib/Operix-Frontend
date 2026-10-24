import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { ReviewDialog } from "@/features/submissions/components/ReviewDialog/ReviewDialog";
import { SUBMISSION_AI_REVIEW_STRINGS } from "@/features/submissions/components/SubmissionAiReview";
import type { Submission } from "@/features/submissions/types/submission.types";
import type { SubmissionAiReviewResponse } from "@/features/submissions/types/submission-ai.types";

const mocks = vi.hoisted(() => ({
  analyze: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/features/submissions/api/review.api", () => ({
  reviewApi: {
    analyze: mocks.analyze,
    create: mocks.create,
  },
}));

const submission = (id: string, version: number): Submission => ({
  id,
  taskId: "task-1",
  submittedById: "member-1",
  version,
  submissionText: `Submission ${version}`,
  submittedAt: "2026-08-23T00:00:00.000Z",
  createdAt: "2026-08-23T00:00:00.000Z",
  attachments: [],
});

const aiReview = (
  overrides: Partial<SubmissionAiReviewResponse> = {},
): SubmissionAiReviewResponse => ({
  summary: "The Submission covers the core steps.",
  requirementCoverage: [
    { requirement: "Cold chain log", status: "COVERED", evidence: "Log attached." },
    { requirement: "Supervisor sign-off", status: "MISSING", evidence: "No signature found." },
  ],
  issues: [
    {
      severity: "MEDIUM",
      finding: "Unclear dosing note",
      rationale: "The note does not state the concentration.",
    },
  ],
  questionsForReviewer: ["Was the fridge reading verified?"],
  suggestedDecision: "REQUEST_REVISION",
  suggestedFeedback: "Please add the supervisor signature and clarify the dosing note.",
  limitations: ["This analysis covers only the current Submission version."],
  meta: { provider: "gemini", model: "gemini-test", attempts: 1, latencyMs: 812 },
  ...overrides,
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const renderDialog = (
  options: {
    submission?: Submission | null;
    canAnalyzeAi?: boolean;
    onSubmit?: () => Promise<boolean>;
  } = {},
) => {
  const onSubmit = options.onSubmit ?? vi.fn().mockResolvedValue(true);

  return render(
    <ReviewDialog
      submission={
        options.submission === undefined ? submission("submission-1", 2) : options.submission
      }
      pending={false}
      error={null}
      canAnalyzeAi={options.canAnalyzeAi ?? true}
      onSubmit={onSubmit}
      onClose={vi.fn()}
    />,
  );
};

describe("ReviewDialog AI review assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides the AI panel when the host gate denies it", () => {
    renderDialog({ canAnalyzeAi: false });

    expect(
      screen.queryByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: SUBMISSION_AI_REVIEW_STRINGS.sectionTitle }),
    ).not.toBeInTheDocument();
    // Manual review is untouched.
    expect(screen.getByRole("button", { name: "Save Review" })).toBeEnabled();
  });

  it("explains supported attachment analysis without weakening human review", () => {
    renderDialog();

    expect(screen.getByText(SUBMISSION_AI_REVIEW_STRINGS.analyzeHint)).toHaveTextContent(
      "may analyze supported attached documents",
    );
    expect(screen.getByText(SUBMISSION_AI_REVIEW_STRINGS.analyzeHint)).toHaveTextContent(
      "cannot approve, reject, or change the Task",
    );
  });

  it("analyzes the current submission and disables only the Analyze button while loading", async () => {
    const pending = deferred<SubmissionAiReviewResponse>();
    mocks.analyze.mockReturnValueOnce(pending.promise);

    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }));

    const analyzingButton = screen.getByRole("button", {
      name: SUBMISSION_AI_REVIEW_STRINGS.analyzing,
    });
    expect(analyzingButton).toBeDisabled();
    expect(screen.getByLabelText(/Feedback/)).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save Review" })).toBeEnabled();
    expect(mocks.analyze).toHaveBeenCalledWith("submission-1", expect.any(AbortSignal));

    pending.resolve(aiReview());

    await waitFor(() =>
      expect(screen.getByText("The Submission covers the core steps.")).toBeInTheDocument(),
    );
    expect(screen.getByText("Suggests requesting a revision")).toBeInTheDocument();
    expect(
      screen.getByText("Please add the supervisor signature and clarify the dosing note."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This analysis covers only the current Submission version."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }),
    ).toBeEnabled();
  });

  it("copies suggested feedback without submitting or changing the Decision", async () => {
    mocks.analyze.mockResolvedValueOnce(aiReview());
    const onSubmit = vi.fn().mockResolvedValue(true);

    renderDialog({ onSubmit });

    fireEvent.click(screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.useSuggestedFeedback }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.useSuggestedFeedback }),
    );

    expect(screen.getByLabelText(/Feedback/)).toHaveValue(
      "Please add the supervisor signature and clarify the dosing note.",
    );
    expect(screen.getByRole("radio", { name: "Approve" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Request Revision" })).not.toBeChecked();
    expect(screen.getByText(SUBMISSION_AI_REVIEW_STRINGS.feedbackApplied)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps manual review usable after an AI provider failure", async () => {
    mocks.analyze.mockRejectedValueOnce(
      new OperixApiError("provider down", { status: 503, code: "AI_PROVIDER_UNAVAILABLE" }),
    );
    const onSubmit = vi.fn().mockResolvedValue(true);

    renderDialog({ onSubmit });

    fireEvent.click(screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("You can still review this Submission manually.");
    expect(
      screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }),
    ).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/Feedback/), {
      target: { value: "Manual reviewer feedback" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Review" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        action: "APPROVE",
        feedback: "Manual reviewer feedback",
      }),
    );
  });

  it("surfaces the authority-loss copy instead of a provider failure", async () => {
    mocks.analyze.mockRejectedValueOnce(
      new OperixApiError("forbidden", { status: 403, code: "FORBIDDEN" }),
    );

    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You no longer have permission to analyze this submission. Refresh the submission and try again.",
    );
  });

  it("discards an in-flight analysis when the submission version changes", async () => {
    const stale = deferred<SubmissionAiReviewResponse>();
    mocks.analyze.mockReturnValueOnce(stale.promise);

    const { rerender } = renderDialog({ submission: submission("submission-1", 2) });

    fireEvent.click(screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }));

    rerender(
      <ReviewDialog
        submission={submission("submission-2", 3)}
        pending={false}
        error={null}
        canAnalyzeAi
        onSubmit={vi.fn().mockResolvedValue(true)}
        onClose={vi.fn()}
      />,
    );

    // The new version starts from a clean panel, not the old "Analyzing..." state.
    expect(
      screen.getByRole("button", { name: SUBMISSION_AI_REVIEW_STRINGS.analyze }),
    ).toBeEnabled();

    stale.resolve(aiReview({ summary: "Stale analysis of version 2." }));

    await waitFor(() =>
      expect(screen.queryByText("Stale analysis of version 2.")).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
