import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { MemberDetails } from "./MemberDetails";
import type { Member } from "../../types/member.types";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useMember: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("../../hooks/use-member", () => ({
  useMember: mocks.useMember,
}));

vi.mock("../../api/member.api", () => ({
  memberApi: {
    update: mocks.update,
    updateStatus: mocks.updateStatus,
  },
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
