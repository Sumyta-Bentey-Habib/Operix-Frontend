import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminStatusDialog } from "@/features/admins/components/AdminStatusDialog/AdminStatusDialog";
import type { Admin } from "@/features/admins/types/admin.types";

const admin: Admin = {
  id: "admin-1",
  name: "Admin A",
  email: "admin@example.com",
  employeeId: null,
  designation: null,
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: "2026-08-23T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
};

describe("AdminStatusDialog", () => {
  it("does not allow same status submission", () => {
    render(<AdminStatusDialog admin={admin} onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save Status" })).toBeDisabled();
  });

  it("requires confirmation for suspended status", async () => {
    const onSubmit = vi.fn();

    render(<AdminStatusDialog admin={admin} onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "SUSPENDED" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Status" }));

    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Set SUSPENDED" }));
    expect(onSubmit).toHaveBeenCalledWith("SUSPENDED");
  });

  it("renders specific conflict errors", () => {
    render(
      <AdminStatusDialog
        admin={admin}
        error="This Admin still owns one or more teams. Reassign those teams before making the account inactive or suspended."
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Reassign those teams");
  });
});
