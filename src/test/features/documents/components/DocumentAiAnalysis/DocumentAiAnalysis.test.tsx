import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DocumentAiAnalysis,
  DOCUMENT_AI_STRINGS,
  type DocumentAiAnalysisProps,
} from "@/features/documents/components/DocumentAiAnalysis/DocumentAiAnalysis";
import type { DocumentAiAnalysis as DocumentAiAnalysisResult } from "@/features/documents/types/document-ai.types";

const completeAnalysis: DocumentAiAnalysisResult = {
  documentId: "doc-public-1",
  summary: "The supplier agreement renews automatically unless cancelled.",
  keyPoints: ["Renewal is annual.", "Cancellation requires 30 days notice."],
  actionItems: [
    {
      action: "Record the renewal date",
      ownerMentioned: "Rz Arnab",
      dueDateMentioned: "2026-12-01",
    },
    { action: "Confirm the notice window", ownerMentioned: null, dueDateMentioned: null },
  ],
  importantDates: [{ dateText: "2026-12-01", context: "Renewal date" }],
  risksOrWarnings: ["Notice period may have passed."],
  confidence: "HIGH",
  limitations: ["AI document analysis is advisory only."],
  meta: { provider: "gemini", model: "test-model", latencyMs: 1200, attempts: 2 },
};

const renderPanel = (overrides: Partial<DocumentAiAnalysisProps> = {}) => {
  const props: DocumentAiAnalysisProps = {
    documentName: "Reference.pdf",
    analysis: null,
    pending: false,
    error: null,
    ...overrides,
  };

  return render(<DocumentAiAnalysis {...props} />);
};

describe("DocumentAiAnalysis", () => {
  it("renders every section of a complete analysis", () => {
    renderPanel({ analysis: completeAnalysis });

    expect(
      screen.getByRole("region", { name: `${DOCUMENT_AI_STRINGS.title} for Reference.pdf` }),
    ).toBeInTheDocument();
    expect(screen.getByText(completeAnalysis.summary)).toBeInTheDocument();

    for (const heading of [
      DOCUMENT_AI_STRINGS.summary,
      DOCUMENT_AI_STRINGS.keyPoints,
      DOCUMENT_AI_STRINGS.actionItems,
      DOCUMENT_AI_STRINGS.importantDates,
      DOCUMENT_AI_STRINGS.risks,
      DOCUMENT_AI_STRINGS.confidence,
      DOCUMENT_AI_STRINGS.limitations,
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }

    expect(screen.getByText("Renewal is annual.")).toBeInTheDocument();
    expect(screen.getByText("Record the renewal date")).toBeInTheDocument();
    expect(screen.getByText("2026-12-01")).toBeInTheDocument();
    expect(screen.getByText("Notice period may have passed.")).toBeInTheDocument();
    expect(screen.getByText("AI document analysis is advisory only.")).toBeInTheDocument();
  });

  it("falls back to explicit placeholders when an action item has no owner or due date", () => {
    renderPanel({ analysis: completeAnalysis });

    const actionItems = screen.getByRole("heading", { name: DOCUMENT_AI_STRINGS.actionItems })
      .parentElement as HTMLElement;

    expect(within(actionItems).getByText("Confirm the notice window")).toBeInTheDocument();
    expect(
      within(actionItems).getByText(
        `${DOCUMENT_AI_STRINGS.noOwner} · ${DOCUMENT_AI_STRINGS.noDueDate}`,
      ),
    ).toBeInTheDocument();
  });

  it("omits optional sections that have no content", () => {
    renderPanel({
      analysis: {
        ...completeAnalysis,
        keyPoints: [],
        actionItems: [],
        importantDates: [],
        risksOrWarnings: [],
        limitations: [],
      },
    });

    for (const heading of [
      DOCUMENT_AI_STRINGS.keyPoints,
      DOCUMENT_AI_STRINGS.actionItems,
      DOCUMENT_AI_STRINGS.importantDates,
      DOCUMENT_AI_STRINGS.risks,
      DOCUMENT_AI_STRINGS.limitations,
    ]) {
      expect(screen.queryByRole("heading", { name: heading })).not.toBeInTheDocument();
    }

    // The always-present sections survive.
    expect(screen.getByRole("heading", { name: DOCUMENT_AI_STRINGS.summary })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: DOCUMENT_AI_STRINGS.confidence }),
    ).toBeInTheDocument();
  });

  it("shows the localized confidence label instead of the raw enum", () => {
    renderPanel({ analysis: { ...completeAnalysis, confidence: "MEDIUM" } });

    expect(screen.getByText("Medium")).toHaveAttribute("data-confidence", "MEDIUM");
    expect(screen.queryByText("MEDIUM")).not.toBeInTheDocument();
  });

  it("shows a loading status while pending and hides any previous result", () => {
    renderPanel({ analysis: completeAnalysis, pending: true });

    expect(screen.getByRole("status")).toHaveTextContent(DOCUMENT_AI_STRINGS.analyzing);
    expect(screen.queryByText(completeAnalysis.summary)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: DOCUMENT_AI_STRINGS.summary }),
    ).not.toBeInTheDocument();
  });

  it("shows an error alert and no result when the request fails", () => {
    renderPanel({ error: "AI analysis is temporarily unavailable." });

    expect(screen.getByRole("alert")).toHaveTextContent("AI analysis is temporarily unavailable.");
    expect(
      screen.queryByRole("heading", { name: DOCUMENT_AI_STRINGS.summary }),
    ).not.toBeInTheDocument();
  });

  it("renders the advisory run metadata including pluralized attempts", () => {
    renderPanel({ analysis: completeAnalysis });

    expect(screen.getByText(/gemini · test-model · 1200 ms · 2 attempts/)).toBeInTheDocument();
  });

  it("pluralizes a single attempt", () => {
    renderPanel({
      analysis: { ...completeAnalysis, meta: { ...completeAnalysis.meta, attempts: 1 } },
    });

    expect(screen.getByText(/1 attempt$/)).toBeInTheDocument();
  });

  it("exposes no controls that could mutate workflow state", () => {
    const { container } = renderPanel({ analysis: completeAnalysis });

    // Advisory only: nothing in the panel can assign, complete, submit or
    // otherwise change a Task, Submission, or Document.
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(container.querySelectorAll("form")).toHaveLength(0);
    expect(container.querySelectorAll("input, textarea, select")).toHaveLength(0);
    expect(container.querySelectorAll("[contenteditable]")).toHaveLength(0);
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });

  it("always states that the content is AI generated", () => {
    renderPanel({ analysis: completeAnalysis });

    expect(screen.getByText(DOCUMENT_AI_STRINGS.advisory)).toBeInTheDocument();
  });
});
