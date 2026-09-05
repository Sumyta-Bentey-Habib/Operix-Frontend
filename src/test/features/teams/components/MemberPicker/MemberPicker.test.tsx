import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemberPicker } from "@/features/teams/components/MemberPicker/MemberPicker";
import type { Member } from "@/features/members/types/member.types";

const mocks = vi.hoisted(() => ({
  useMembers: vi.fn(),
}));

vi.mock("@/features/members/hooks/use-members", () => ({
  useMembers: mocks.useMembers,
}));

const member: Member = {
  id: "member-1",
  name: "Member A",
  email: "member@example.com",
  employeeId: "EMP-1",
  designation: "Executive",
  role: "MEMBER",
  status: "ACTIVE",
  createdAt: "2026-08-23T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
};

describe("MemberPicker", () => {
  it("disables non-active Members without inventing assignment state", () => {
    mocks.useMembers.mockReturnValue({
      members: [
        member,
        { ...member, id: "member-2", name: "Member B", status: "INACTIVE" },
        { ...member, id: "member-3", name: "Member C", status: "SUSPENDED" },
      ],
      meta: { page: 1, limit: 20, total: 3, totalPages: 1 },
      loading: false,
      error: null,
      setPage: vi.fn(),
      refresh: vi.fn(),
    });

    render(<MemberPicker selectedMemberId="" onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Member A/ })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /Member B/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Member C/ })).toBeDisabled();
    expect(screen.queryByText(/Unassigned|Assigned|Available|In Team/)).not.toBeInTheDocument();
  });
});
