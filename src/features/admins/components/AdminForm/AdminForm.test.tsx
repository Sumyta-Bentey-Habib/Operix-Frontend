import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminForm } from "./AdminForm";
import type { Admin } from "../../types/admin.types";

const admin: Admin = {
  id: "admin-1",
  name: "Admin A",
  email: "admin@example.com",
  employeeId: "EMP-1",
  designation: "Manager",
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: "2026-08-23T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
};

describe("AdminForm", () => {
  it("omits blank optional fields when creating", async () => {
    const onSubmit = vi.fn();

    render(<AdminForm mode="create" onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "Admin B" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "adminb@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Initial Password/), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Admin B",
      email: "adminb@example.com",
      initialPassword: "Password123!",
    });
  });

  it("disables save when edit is unchanged", () => {
    render(<AdminForm mode="edit" admin={admin} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("submits only changed editable fields", async () => {
    const onSubmit = vi.fn();

    render(<AdminForm mode="edit" admin={admin} onSubmit={onSubmit} onCancel={vi.fn()} />);

    const designation = screen.getByLabelText(/Designation/);
    fireEvent.change(designation, {
      target: { value: "Operations Lead" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      designation: "Operations Lead",
    });
  });

  it("uses null when clearing nullable update fields", async () => {
    const onSubmit = vi.fn();

    render(<AdminForm mode="edit" admin={admin} onSubmit={onSubmit} onCancel={vi.fn()} />);

    const employeeId = screen.getByLabelText(/Employee ID/);
    fireEvent.change(employeeId, {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      employeeId: null,
    });
  });
});
