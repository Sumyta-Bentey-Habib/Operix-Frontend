import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { AdminDetails } from "./AdminDetails";
import type { Admin } from "../../types/admin.types";

const mocks = vi.hoisted(() => ({
  useAdmin: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock("../../hooks/use-admin", () => ({
  useAdmin: mocks.useAdmin,
}));

vi.mock("../../api/admin.api", () => ({
  adminApi: {
    update: mocks.update,
    updateStatus: mocks.updateStatus,
  },
}));

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

const defaultHook = {
  admin,
  loading: false,
  error: null,
  setAdmin: vi.fn(),
  refresh: vi.fn(),
};

describe("AdminDetails", () => {
  it("renders loading state", () => {
    mocks.useAdmin.mockReturnValue({
      ...defaultHook,
      admin: null,
      loading: true,
    });

    render(<AdminDetails adminId="admin-1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading Admin details");
  });

  it("renders not found error state", () => {
    mocks.useAdmin.mockReturnValue({
      ...defaultHook,
      admin: null,
      error: new OperixApiError("Admin not found.", {
        status: 404,
        code: "ADMIN_NOT_FOUND",
      }),
    });

    render(<AdminDetails adminId="admin-1" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Admin unavailable");
  });

  it("renders Admin detail fields", () => {
    mocks.useAdmin.mockReturnValue(defaultHook);

    render(<AdminDetails adminId="admin-1" />);

    expect(screen.getAllByText("Admin A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin@example.com").length).toBeGreaterThan(0);
    expect(screen.getByText("EMP-1")).toBeInTheDocument();
  });

  it("updates changed fields only", async () => {
    mocks.useAdmin.mockReturnValue(defaultHook);
    mocks.update.mockResolvedValueOnce({
      ...admin,
      designation: "Operations Lead",
    });

    render(<AdminDetails adminId="admin-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText(/Designation/), {
      target: { value: "Operations Lead" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith("admin-1", {
        designation: "Operations Lead",
      }),
    );
  });
});
