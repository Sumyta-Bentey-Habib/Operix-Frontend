import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TopNavbar } from "@/components/layout/TopNavbar";

const mocks = vi.hoisted(() => ({ role: "MEMBER", push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    viewer: {
      userId: "viewer-1",
      role: mocks.role,
      status: "ACTIVE",
      scope: mocks.role === "ADMIN" ? { type: "ADMIN", teamIds: [] } : { type: "GLOBAL" },
    },
    profile: { name: "Operix User", email: "user@example.test", image: null },
    signOut: vi.fn(),
  }),
}));
vi.mock("@/features/notifications", () => ({
  NotificationBell: () => <button type="button">Notifications</button>,
}));
vi.mock("@/components/layout/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe("TopNavbar Ask Operix trigger", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(["MEMBER", "ADMIN", "SUPER_ADMIN"])("is available to %s", (role) => {
    mocks.role = role;
    const onAskOperix = vi.fn();
    render(<TopNavbar onAskOperix={onAskOperix} />);
    fireEvent.click(screen.getByRole("button", { name: "Ask Operix" }));
    expect(onAskOperix).toHaveBeenCalledOnce();
  });
});
