import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemberForm, buildMemberUpdateInput } from "./MemberForm";
import type { Member } from "../../types/member.types";

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

describe("MemberForm", () => {
  it("omits blank optional create fields", () => {
    const onSubmit = vi.fn();

    render(
      <MemberForm mode="create" viewerRole="SUPER_ADMIN" onSubmit={onSubmit} onCancel={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "Member B" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "memberb@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Initial Password/), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Member B",
      email: "memberb@example.com",
      initialPassword: "Password123!",
    });
  });

  it("builds SUPER_ADMIN employeeId clear with null", () => {
    expect(
      buildMemberUpdateInput({
        viewerRole: "SUPER_ADMIN",
        original: member,
        values: {
          name: "Member A",
          employeeId: "",
          designation: "Executive",
        },
      }),
    ).toEqual({
      employeeId: null,
    });
  });

  it("builds ADMIN designation clear without employeeId", () => {
    expect(
      buildMemberUpdateInput({
        viewerRole: "ADMIN",
        original: member,
        values: {
          name: "Member A",
          employeeId: "CHANGED-BUT-FORBIDDEN",
          designation: "",
        },
      }),
    ).toEqual({
      designation: null,
    });
  });

  it("keeps employee ID read-only for ADMIN edits", () => {
    render(
      <MemberForm
        mode="edit"
        viewerRole="ADMIN"
        member={member}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Employee ID/)).toHaveAttribute("readonly");
  });

  it("disables Save for unchanged edit", () => {
    render(
      <MemberForm
        mode="edit"
        viewerRole="SUPER_ADMIN"
        member={member}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
