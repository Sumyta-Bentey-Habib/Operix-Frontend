import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { TeamList } from "./TeamList";
import type { Team } from "../../types/team.types";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTeams: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  reassignAdmin: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("../../hooks/use-teams", () => ({
  useTeams: mocks.useTeams,
}));

vi.mock("../../api/team.api", () => ({
  teamApi: {
    create: mocks.create,
    update: mocks.update,
    reassignAdmin: mocks.reassignAdmin,
  },
}));

vi.mock("../AdminPicker", () => ({
  AdminPicker: ({
    onSelect,
    currentAdminId,
  }: {
    onSelect: (admin: unknown) => void;
    currentAdminId?: string;
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: currentAdminId ? "admin-2" : "admin-1",
          name: "Admin Pick",
          email: "admin@example.com",
          employeeId: null,
          designation: null,
          role: "ADMIN",
          status: "ACTIVE",
          createdAt: "2026-08-23T00:00:00.000Z",
          updatedAt: "2026-08-23T00:00:00.000Z",
        })
      }
    >
      Pick Admin
    </button>
  ),
}));

const team: Team = {
  id: "team-1",
  name: "Team A",
  adminId: "admin-1",
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
  teams: [team],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  loading: false,
  error: null,
  setPage: vi.fn(),
  refresh: vi.fn(),
};

describe("TeamList", () => {
  it("renders loading, empty, and error states", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useTeams.mockReturnValue({ ...defaultHook, teams: [], loading: true });
    const { rerender } = render(<TeamList />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Teams");

    mocks.useTeams.mockReturnValue({
      ...defaultHook,
      teams: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    rerender(<TeamList />);
    expect(screen.getByText("No Teams found")).toBeInTheDocument();

    mocks.useTeams.mockReturnValue({
      ...defaultHook,
      teams: [],
      error: new OperixApiError("Team missing", { status: 404, code: "TEAM_NOT_FOUND" }),
    });
    rerender(<TeamList />);
    expect(screen.getByRole("alert")).toHaveTextContent("Team unavailable");
  });

  it("shows mutation actions only to SUPER_ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useTeams.mockReturnValue(defaultHook);

    render(<TeamList />);

    expect(screen.getByRole("button", { name: "Create Team" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reassign Admin" })).toBeInTheDocument();
    expect(screen.queryByText("adminName")).not.toBeInTheDocument();
    expect(screen.queryByText("memberCount")).not.toBeInTheDocument();
  });

  it("renders ADMIN read-only actions", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useTeams.mockReturnValue(defaultHook);

    render(<TeamList />);

    expect(screen.queryByRole("button", { name: "Create Team" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reassign Admin" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View" })).toBeInTheDocument();
  });

  it("creates Team after selecting a paginated Admin", async () => {
    mocks.create.mockResolvedValueOnce(team);
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useTeams.mockReturnValue(defaultHook);

    render(<TeamList />);

    fireEvent.click(screen.getByRole("button", { name: "Create Team" }));
    fireEvent.change(screen.getByLabelText(/Team Name/), {
      target: { value: "Team B" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Pick Admin" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith({
        name: "Team B",
        adminId: "admin-1",
      }),
    );
    expect(JSON.stringify(mocks.create.mock.calls[0]?.[0])).not.toContain("memberIds");
  });

  it("renames Team and avoids unchanged PATCH through disabled save", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useTeams.mockReturnValue(defaultHook);

    render(<TeamList />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
