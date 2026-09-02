import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { MemberList } from "./MemberList";
import type { Member } from "../../types/member.types";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useMembers: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("../../hooks/use-members", () => ({
  useMembers: mocks.useMembers,
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
  members: [member],
  meta: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  },
  loading: false,
  error: null,
  setPage: vi.fn(),
  refresh: vi.fn(),
};

describe("MemberList", () => {
  it("renders loading state", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMembers.mockReturnValue({
      ...defaultHook,
      members: [],
      loading: true,
    });

    render(<MemberList />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading Members");
  });

  it("renders empty state", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMembers.mockReturnValue({
      ...defaultHook,
      members: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    render(<MemberList />);

    expect(screen.getByText("No Members found")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMembers.mockReturnValue({
      ...defaultHook,
      members: [],
      error: new OperixApiError("Forbidden", {
        status: 403,
        code: "FORBIDDEN",
      }),
    });

    render(<MemberList />);

    expect(screen.getByRole("alert")).toHaveTextContent("permission");
  });

  it("hides create but shows status actions to SUPER_ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMembers.mockReturnValue(defaultHook);

    render(<MemberList />);

    expect(screen.queryByRole("button", { name: "Create Member" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change Status" })).toBeInTheDocument();
  });

  it("hides create and status actions from ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useMembers.mockReturnValue(defaultHook);

    render(<MemberList />);

    expect(screen.queryByRole("button", { name: "Create Member" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change Status" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("paginates through the hook", () => {
    const setPage = vi.fn();
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMembers.mockReturnValue({
      ...defaultHook,
      meta: { page: 1, limit: 20, total: 40, totalPages: 2 },
      setPage,
    });

    render(<MemberList />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(setPage).toHaveBeenCalledWith(2);
  });

});
