import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

const authMock = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: authMock.useAuth,
}));

const viewer = (role: "SUPER_ADMIN" | "ADMIN" | "MEMBER") => ({
  userId: "user-1",
  role,
  status: "ACTIVE",
  scope: { type: "GLOBAL" },
});

describe("PermissionGuard", () => {
  it("waits while auth is loading", () => {
    authMock.useAuth.mockReturnValue({ isLoading: true, viewer: null });

    render(
      <PermissionGuard allowedRoles={["SUPER_ADMIN"]}>
        <div>Admin management</div>
      </PermissionGuard>,
    );

    expect(screen.queryByText("Admin management")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("allows SUPER_ADMIN", () => {
    authMock.useAuth.mockReturnValue({
      isLoading: false,
      viewer: viewer("SUPER_ADMIN"),
    });

    render(
      <PermissionGuard allowedRoles={["SUPER_ADMIN"]}>
        <div>Admin management</div>
      </PermissionGuard>,
    );

    expect(screen.getByText("Admin management")).toBeInTheDocument();
  });

  it.each(["ADMIN", "MEMBER"] as const)("blocks %s", (role) => {
    authMock.useAuth.mockReturnValue({
      isLoading: false,
      viewer: viewer(role),
    });

    render(
      <PermissionGuard allowedRoles={["SUPER_ADMIN"]}>
        <div>Admin management</div>
      </PermissionGuard>,
    );

    expect(screen.queryByText("Admin management")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("You do not have permission");
  });
});
