import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignInPage } from "@/components/auth/SignInPage";
import { AUTH_STRINGS } from "@/constants/auth-strings";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
  }),
}));

describe("SignInPage recovery entry point", () => {
  it("links the forgot-password control to the self-service page", () => {
    render(<SignInPage />);

    const link = screen.getByRole("link", { name: AUTH_STRINGS.signIn.forgotPassword });

    expect(link).toHaveAttribute("href", "/forgot-password");
  });

  it("no longer tells users to contact an administrator for password recovery", () => {
    render(<SignInPage />);

    expect(screen.queryByText(/contact your Operix IT Administrator/i)).not.toBeInTheDocument();
  });
});
