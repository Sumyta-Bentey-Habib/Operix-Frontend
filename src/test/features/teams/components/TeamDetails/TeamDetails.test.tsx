import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { TeamDetails } from "@/features/teams/components/TeamDetails/TeamDetails";
import type { Team } from "@/features/teams/types/team.types";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTeam: vi.fn(),
  update: vi.fn(),
  reassignAdmin: vi.fn(),
  assignMember: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/features/teams/hooks/use-team", () => ({
  useTeam: mocks.useTeam,
}));

vi.mock("@/features/teams/api/team.api", () => ({
  teamApi: {
    update: mocks.update,
    reassignAdmin: mocks.reassignAdmin,
    assignMember: mocks.assignMember,
  },
}));

vi.mock("@/features/teams/components/ReassignAdminDialog", () => ({
  ReassignAdminDialog: ({
    team,
    error,
    onSubmit,
  }: {
    team: Team | null;
    error?: string | null;
    onSubmit: (adminId: string) => void;
  }) =>
    team ? (
      <div role="dialog" aria-label="Reassign Team Admin">
        {error && <p role="alert">{error}</p>}
        <button type="button" onClick={() => onSubmit("admin-2")}>
          Confirm Reassign
        </button>
      </div>
    ) : null,
}));

vi.mock("@/features/teams/components/AssignMemberDialog", () => ({
  AssignMemberDialog: ({
    team,
    error,
    onSubmit,
  }: {
    team: Team | null;
    error?: string | null;
    onSubmit: (memberId: string) => void;
  }) =>
    team ? (
      <div role="dialog" aria-label="Assign Member">
        {error && <p role="alert">{error}</p>}
        <button type="button" onClick={() => onSubmit("member-1")}>
          Confirm Assign
        </button>
      </div>
    ) : null,
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
  team,
  loading: false,
  error: null,
  setTeam: vi.fn(),
  refresh: vi.fn(),
};

describe("TeamDetails", () => {
  it("renders privacy safe not found state", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useTeam.mockReturnValue({
      ...defaultHook,
      team: null,
      error: new OperixApiError("Team not found.", {
        status: 404,
        code: "TEAM_NOT_FOUND",
      }),
    });

    render(<TeamDetails teamId="team-1" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Team unavailable");
    expect(screen.getByRole("alert")).not.toHaveTextContent("another Admin");
  });

  it("shows assign member and hides edit/reassign detail actions for ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useTeam.mockReturnValue(defaultHook);

    render(<TeamDetails teamId="team-1" />);

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reassign Admin" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assign Member" })).toBeInTheDocument();
  });

  it("renames Team and avoids unchanged PATCH through disabled save", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useTeam.mockReturnValue(defaultHook);

    render(<TeamDetails teamId="team-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("handles reassignment conflicts", async () => {
    mocks.reassignAdmin.mockRejectedValueOnce(
      new OperixApiError("Already assigned", {
        status: 409,
        code: "TEAM_ALREADY_ASSIGNED_TO_ADMIN",
      }),
    );
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useTeam.mockReturnValue(defaultHook);

    render(<TeamDetails teamId="team-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Reassign Admin" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Reassign" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("already assigned"));
  });

  it("handles assignment already assigned conflict", async () => {
    mocks.assignMember.mockRejectedValueOnce(
      new OperixApiError("Already assigned", {
        status: 409,
        code: "MEMBER_ALREADY_ASSIGNED",
      }),
    );
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useTeam.mockReturnValue(defaultHook);

    render(<TeamDetails teamId="team-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Assign Member" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Assign" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Use Transfer"));
    expect(mocks.assignMember).toHaveBeenCalledTimes(1);
  });
});
