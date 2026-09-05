import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemberStatusDialog } from "@/features/members/components/MemberStatusDialog/MemberStatusDialog";
import type { Member } from "@/features/members/types/member.types";

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

describe("MemberStatusDialog", () => {
  it("disables save when status is unchanged", () => {
    render(<MemberStatusDialog member={member} onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save Status" })).toBeDisabled();
  });

  it("requires confirmation for suspended status", () => {
    const onSubmit = vi.fn();
    render(<MemberStatusDialog member={member} onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "SUSPENDED" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Status" }));

    expect(screen.getByText("Confirm status change")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set SUSPENDED" }));
    expect(onSubmit).toHaveBeenCalledWith("SUSPENDED");
  });

  it("renders safe status errors", () => {
    render(
      <MemberStatusDialog
        member={member}
        error="You don't have permission to perform this action."
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("permission");
  });
});
