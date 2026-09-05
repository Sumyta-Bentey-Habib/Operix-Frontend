import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemberWorkloadTable } from "@/features/dashboard/components/MemberWorkloadTable";
import type { MemberWorkloadRow } from "@/features/dashboard/types/dashboard.types";

const mockMembers: MemberWorkloadRow[] = [
  {
    member: {
      id: "mem-1",
      name: "Sarah Chen",
      employeeId: "EMP-1001",
      designation: "Quality Control Lead",
      teamId: "team-1",
      teamName: "Formulation Alpha",
    },
    workload: {
      activeTasks: 4,
      overdueTasks: 1,
      statusCounts: {
        PENDING: 1,
        ASSIGNED: 2,
        IN_PROGRESS: 2,
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        COMPLETED: 15,
        REVISION_REQUIRED: 0,
        RESUBMITTED: 0,
        CANCELLED: 0,
      },
      activePriorityCounts: {
        LOW: 0,
        MEDIUM: 2,
        HIGH: 1,
        URGENT: 1,
      },
    },
  },
  {
    member: {
      id: "mem-2",
      name: "David Kim",
      employeeId: null,
      designation: null,
      teamId: null,
      teamName: null,
    },
    workload: {
      activeTasks: 0,
      overdueTasks: 0,
      statusCounts: {
        PENDING: 0,
        ASSIGNED: 0,
        IN_PROGRESS: 0,
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        COMPLETED: 5,
        REVISION_REQUIRED: 0,
        RESUBMITTED: 0,
        CANCELLED: 0,
      },
      activePriorityCounts: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      },
    },
  },
];

describe("MemberWorkloadTable", () => {
  it("renders empty state when members list is empty", () => {
    render(<MemberWorkloadTable members={[]} />);

    expect(screen.getByText("No Member workload")).toBeInTheDocument();
    expect(screen.getByText("No Member workload records were returned.")).toBeInTheDocument();
  });

  it("renders member identity with avatar, name, and employee ID without text concatenation", () => {
    render(<MemberWorkloadTable members={mockMembers} />);

    // Sarah Chen
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("SC")).toBeInTheDocument();
    expect(screen.getByText("EMP-1001")).toBeInTheDocument();
    expect(screen.getByText("• Quality Control Lead")).toBeInTheDocument();
    expect(screen.getByText("Formulation Alpha")).toBeInTheDocument();

    // Active & Overdue
    expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);

    // David Kim
    expect(screen.getByText("David Kim")).toBeInTheDocument();
    expect(screen.getByText("DK")).toBeInTheDocument();
    expect(screen.getByText("No Employee ID")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("defensively handles flat or missing member properties gracefully", () => {
    // Simulating backend response returning nulls or empty member relations
    const unpopulatedRow = [
      {
        member: null as unknown as MemberWorkloadRow["member"],
        workload: null as unknown as MemberWorkloadRow["workload"],
      },
    ];

    render(<MemberWorkloadTable members={unpopulatedRow} />);

    expect(screen.getByText("Member 1")).toBeInTheDocument();
    expect(screen.getByText("M1")).toBeInTheDocument();
    expect(screen.getByText("No Employee ID")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("filters members when user types in the search input", () => {
    render(<MemberWorkloadTable members={mockMembers} />);

    const searchInput = screen.getByPlaceholderText("Search member by name, ID or team...");
    fireEvent.change(searchInput, { target: { value: "Sarah" } });

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.queryByText("David Kim")).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByLabelText("Clear search");
    fireEvent.click(clearBtn);

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("David Kim")).toBeInTheDocument();
  });

  it("renders pagination component inside table card when provided", () => {
    render(
      <MemberWorkloadTable
        members={mockMembers}
        pagination={<div data-testid="custom-pagination">Page 1 of 1</div>}
      />,
    );

    expect(screen.getByTestId("custom-pagination")).toBeInTheDocument();
  });
});
