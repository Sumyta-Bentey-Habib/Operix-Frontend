import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { MemberDetails } from "@/features/members/components/MemberDetails/MemberDetails";
import type { Member } from "@/features/members/types/member.types";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useMember: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  transferMember: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/features/members/hooks/use-member", () => ({
  useMember: mocks.useMember,
}));

vi.mock("@/features/members/api/member.api", () => ({
  memberApi: {
    update: mocks.update,
    updateStatus: mocks.updateStatus,
  },
}));

vi.mock("@/features/teams/api/team-membership.api", () => ({
  teamMembershipApi: {
    transferMember: mocks.transferMember,
  },
}));

vi.mock("@/features/teams/components/TransferMemberDialog", () => ({
  TransferMemberDialog: ({
    member,
    pending,
    error,
    onSubmit,
  }: {
    member: Member | null;
    pending?: boolean;
    error?: string | null;
    onSubmit: (targetTeamId: string) => void;
  }) =>
    member ? (
      <div role="dialog" aria-label="Transfer Member">
        {error && <p role="alert">{error}</p>}
        <button type="button" disabled={pending} onClick={() => onSubmit("team-2")}>
          Confirm Transfer
        </button>
      </div>
    ) : null,
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

const superAdminViewer = {
  userId: "super-1",
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  scope: { type: "GLOBAL" },
};

const adminViewer = {
  userId: "admin-1",
  role: "ADMIN",
  status: "ACTIVE",
  scope: { type: "ADMIN", teamIds: ["team-1"] },
};

const defaultHook = {
  member,
  loading: false,
  error: null,
  setMember: vi.fn(),
  refresh: vi.fn(),
};

describe("MemberDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMember.mockReturnValue({
      ...defaultHook,
      member: null,
      loading: true,
    });

    render(<MemberDetails memberId="member-1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading Member details");
  });

  it("renders privacy safe not found state", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useMember.mockReturnValue({
      ...defaultHook,
      member: null,
      error: new OperixApiError("Member not found.", {
        status: 404,
        code: "MEMBER_NOT_FOUND",
      }),
    });

    render(<MemberDetails memberId="member-1" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Member unavailable");
    expect(screen.getByRole("alert")).not.toHaveTextContent("another Admin");
  });

  it("shows status action only to SUPER_ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMember.mockReturnValue(defaultHook);

    render(<MemberDetails memberId="member-1" />);

    expect(screen.getByRole("button", { name: "Change Status" })).toBeInTheDocument();
  });

  it("hides status action from ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useMember.mockReturnValue(defaultHook);

    render(<MemberDetails memberId="member-1" />);

    expect(screen.queryByRole("button", { name: "Change Status" })).not.toBeInTheDocument();
  });

  it("shows transfer to SUPER_ADMIN even when Member is not active", async () => {
    const inactiveMember = {
      ...member,
      status: "INACTIVE" as const,
    };
    mocks.transferMember.mockResolvedValueOnce({
      id: "team-2",
      name: "Team B",
      adminId: "admin-2",
      createdAt: "2026-08-23T00:00:00.000Z",
      updatedAt: "2026-08-23T00:00:00.000Z",
    });
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMember.mockReturnValue({
      ...defaultHook,
      member: inactiveMember,
    });

    render(<MemberDetails memberId="member-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Transfer" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Transfer" }));

    await waitFor(() =>
      expect(mocks.transferMember).toHaveBeenCalledWith("member-1", {
        targetTeamId: "team-2",
      }),
    );
  });

  it("hides transfer from ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useMember.mockReturnValue(defaultHook);

    render(<MemberDetails memberId="member-1" />);

    expect(screen.queryByRole("button", { name: "Transfer" })).not.toBeInTheDocument();
  });

  it("shows transfer concurrency errors without retrying automatically", async () => {
    mocks.transferMember.mockRejectedValueOnce(
      new OperixApiError("Changed", {
        status: 409,
        code: "MEMBER_ASSIGNMENT_CHANGED",
      }),
    );
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMember.mockReturnValue(defaultHook);

    render(<MemberDetails memberId="member-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Transfer" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Transfer" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Refresh and try again"),
    );
    expect(mocks.transferMember).toHaveBeenCalledTimes(1);
  });

  it("ADMIN update excludes employeeId", async () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useMember.mockReturnValue(defaultHook);
    mocks.update.mockResolvedValueOnce({
      ...member,
      designation: "Senior Executive",
    });

    render(<MemberDetails memberId="member-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText(/Designation/), {
      target: { value: "Senior Executive" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith("member-1", {
        designation: "Senior Executive",
      }),
    );
    expect(mocks.update.mock.calls[0]?.[1]).not.toHaveProperty("employeeId");
  });
});
