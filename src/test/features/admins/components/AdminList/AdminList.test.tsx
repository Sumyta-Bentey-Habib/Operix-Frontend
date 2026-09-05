import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { AdminList } from "@/features/admins/components/AdminList/AdminList";
import type { Admin } from "@/features/admins/types/admin.types";

const mocks = vi.hoisted(() => ({
  useAdmins: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock("@/features/admins/hooks/use-admins", () => ({
  useAdmins: mocks.useAdmins,
}));

vi.mock("@/features/admins/api/admin.api", () => ({
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
  admins: [admin],
  meta: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  },
  loading: false,
  error: null,
  setPage: vi.fn(),
  refresh: vi.fn(),
};

describe("AdminList", () => {
  it("renders loading state", () => {
    mocks.useAdmins.mockReturnValue({
      ...defaultHook,
      admins: [],
      loading: true,
    });

    render(<AdminList />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading Admins");
  });

  it("renders empty state", () => {
    mocks.useAdmins.mockReturnValue({
      ...defaultHook,
      admins: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    render(<AdminList />);

    expect(screen.getByText("No Admins found")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mocks.useAdmins.mockReturnValue({
      ...defaultHook,
      admins: [],
      error: new OperixApiError("Forbidden", {
        status: 403,
        code: "FORBIDDEN",
      }),
    });

    render(<AdminList />);

    expect(screen.getByRole("alert")).toHaveTextContent("permission to manage Admins");
  });

  it("renders success state and pagination", () => {
    const setPage = vi.fn();
    mocks.useAdmins.mockReturnValue({
      ...defaultHook,
      meta: { page: 1, limit: 20, total: 40, totalPages: 2 },
      setPage,
    });

    render(<AdminList />);

    expect(screen.getByText("Admin A")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("does not render the Create Admin action", () => {
    mocks.useAdmins.mockReturnValue(defaultHook);

    render(<AdminList />);

    expect(screen.queryByRole("button", { name: "Create Admin" })).not.toBeInTheDocument();
  });

  it("shows ADMIN_HAS_ASSIGNED_TEAMS conflict", async () => {
    mocks.updateStatus.mockRejectedValueOnce(
      new OperixApiError("Admin has assigned teams.", {
        status: 409,
        code: "ADMIN_HAS_ASSIGNED_TEAMS",
      }),
    );
    mocks.useAdmins.mockReturnValue(defaultHook);

    render(<AdminList />);

    fireEvent.click(screen.getByRole("button", { name: "Change Status" }));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "SUSPENDED" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Status" }));
    fireEvent.click(screen.getByRole("button", { name: "Set SUSPENDED" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Reassign those teams"),
    );
  });
});
