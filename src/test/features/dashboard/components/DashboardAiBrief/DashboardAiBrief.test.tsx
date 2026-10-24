import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardAiBrief } from "@/features/dashboard/components/DashboardAiBrief";
import type { DashboardAiBriefResponse } from "@/features/dashboard/types/dashboard-ai.types";

const response: DashboardAiBriefResponse = {
  headline: "Overdue work needs attention",
  executiveSummary: "Two overdue Tasks are present in the authorized snapshot.",
  priorities: [
    {
      severity: "HIGH",
      category: "OVERDUE",
      title: "Review overdue Tasks",
      evidence: "The Dashboard reports two overdue Tasks.",
      suggestedAction: "Review the oldest overdue Tasks first.",
    },
  ],
  workloadObservations: [
    {
      subjectType: "TEAM",
      subject: "Operations",
      observation: "This Team has the highest included active Task count.",
      evidence: "The supplied row contains six active Tasks.",
    },
  ],
  trendSummary: "Three Tasks were completed in seven days.",
  reportingSummary: "One management report is awaiting review.",
  nextActions: ["Review overdue Tasks."],
  confidence: "HIGH",
  limitations: ["This is advisory only."],
  meta: {
    provider: "gemini",
    model: "test-model",
    attempts: 1,
    latencyMs: 24,
    days: 7,
    asOf: "2026-10-24T08:00:00.000Z",
  },
};

describe("DashboardAiBrief", () => {
  it("starts empty and generates only after the explicit action", () => {
    const onGenerate = vi.fn();
    render(
      <DashboardAiBrief
        brief={null}
        days={7}
        pending={false}
        error={null}
        onGenerate={onGenerate}
      />,
    );

    expect(screen.getByText("Generate an operations brief")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate Brief" }));
    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it("renders the structured advisory result and supports refresh", () => {
    const onGenerate = vi.fn();
    render(
      <DashboardAiBrief
        brief={response}
        days={7}
        pending={false}
        error={null}
        onGenerate={onGenerate}
      />,
    );

    expect(screen.getByText(response.headline)).toBeInTheDocument();
    expect(screen.getByText("Review overdue Tasks")).toBeInTheDocument();
    expect(screen.getByText("Workload observations")).toBeInTheDocument();
    expect(screen.getByText("This is advisory only.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh Brief" })).toBeEnabled();
  });

  it("shows an isolated error without hiding the generate action", () => {
    render(
      <DashboardAiBrief
        brief={null}
        days={30}
        pending={false}
        error="AI Operations Brief is temporarily unavailable. Your Dashboard data remains available."
        onGenerate={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Dashboard data remains available");
    expect(screen.getByRole("button", { name: "Generate Brief" })).toBeEnabled();
  });
});
