import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeamForm } from "@/features/teams/components/TeamForm/TeamForm";
import type { Team } from "@/features/teams/types/team.types";

const team: Team = {
  id: "team-1",
  name: "Team A",
  adminId: "admin-1",
  createdAt: "2026-08-23T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
};

describe("TeamForm", () => {
  it("creates Teams with only name and adminId", () => {
    const onSubmit = vi.fn();

    render(<TeamForm mode="create" adminId="admin-1" onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Team Name/), {
      target: { value: "Team B" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Team B",
      adminId: "admin-1",
    });
  });

  it("disables save when create has no Admin", () => {
    render(<TeamForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Team Name/), {
      target: { value: "Team B" },
    });

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("disables save when rename is unchanged", () => {
    render(<TeamForm mode="edit" team={team} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("submits only changed Team name", () => {
    const onSubmit = vi.fn();

    render(<TeamForm mode="edit" team={team} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Team Name/), {
      target: { value: "Renamed Team" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Renamed Team",
    });
  });
});
