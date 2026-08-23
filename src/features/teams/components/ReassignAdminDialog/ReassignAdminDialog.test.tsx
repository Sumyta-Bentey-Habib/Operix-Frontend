import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReassignAdminDialog } from "./ReassignAdminDialog";
import type { Team } from "../../types/team.types";

const mocks = vi.hoisted(() => ({
  selectedAdminId: "admin-1",
}));

vi.mock("../AdminPicker", () => ({
  AdminPicker: ({
    onSelect,
  }: {
    onSelect: (admin: {
      id: string;
      name: string;
      email: string;
      employeeId: null;
      designation: null;
      role: "ADMIN";
      status: "ACTIVE";
      createdAt: string;
      updatedAt: string;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: mocks.selectedAdminId,
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

describe("ReassignAdminDialog", () => {
  it("does not allow submitting the current Admin", () => {
    const onSubmit = vi.fn();

    render(<ReassignAdminDialog team={team} onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Pick Admin" }));

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
