import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminPicker } from "./AdminPicker";
import type { Admin } from "@/features/admins/types/admin.types";

const mocks = vi.hoisted(() => ({
  useAdmins: vi.fn(),
}));

vi.mock("@/features/admins/hooks/use-admins", () => ({
  useAdmins: mocks.useAdmins,
}));

const activeAdmin: Admin = {
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

describe("AdminPicker", () => {
  it("allows active Admin selection and disables non-active Admins", () => {
    const onSelect = vi.fn();
    mocks.useAdmins.mockReturnValue({
      admins: [
        activeAdmin,
        { ...activeAdmin, id: "admin-2", name: "Admin B", status: "INACTIVE" },
        { ...activeAdmin, id: "admin-3", name: "Admin C", status: "SUSPENDED" },
      ],
      meta: { page: 1, limit: 20, total: 3, totalPages: 1 },
      loading: false,
      error: null,
      setPage: vi.fn(),
      refresh: vi.fn(),
    });

    render(<AdminPicker selectedAdminId="" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /Admin A/ }));

    expect(onSelect).toHaveBeenCalledWith(activeAdmin);
    expect(screen.getByRole("button", { name: /Admin B/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Admin C/ })).toBeDisabled();
  });
});
