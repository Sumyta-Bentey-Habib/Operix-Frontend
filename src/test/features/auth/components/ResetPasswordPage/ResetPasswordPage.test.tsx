import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResetPasswordPage } from "@/features/auth/components/ResetPasswordPage/ResetPasswordPage";
import { authApi } from "@/features/auth/api/authApi";
import { OperixApiError } from "@/lib/api";
import { AUTH_STRINGS } from "@/constants/auth-strings";

const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

const typePasswords = (password: string, confirmPassword = password) => {
  fireEvent.change(screen.getByLabelText(/^New Password/i), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText(/^Confirm Password/i), {
    target: { value: confirmPassword },
  });
};

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockGet.mockReset();
  });

  it("offers self-service recovery when the link carries no token", () => {
    mockGet.mockReturnValue(null);

    render(<ResetPasswordPage />);

    expect(
      screen.getByRole("heading", { name: AUTH_STRINGS.resetPassword.invalidTokenTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: new RegExp(AUTH_STRINGS.resetPassword.requestNewLink, "i"),
      }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(
      screen.getByRole("link", { name: AUTH_STRINGS.resetPassword.backToSignIn }),
    ).toHaveAttribute("href", "/login");
    // Never redirect setup-pending users to the administrator flow here.
    expect(screen.queryByText(/contact your administrator/i)).not.toBeInTheDocument();
  });

  it("renders the reset form and live password checklist when a token is present", () => {
    mockGet.mockImplementation((key: string) => (key === "token" ? "reset-token-123" : null));

    render(<ResetPasswordPage />);

    expect(
      screen.getByRole("heading", { name: AUTH_STRINGS.resetPassword.title }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(AUTH_STRINGS.resetPassword.rulesTitle)).toBeInTheDocument();
    expect(screen.getByText(AUTH_STRINGS.resetPassword.rules.minLength)).toBeInTheDocument();
  });

  it("blocks mismatched passwords on the client", () => {
    mockGet.mockImplementation((key: string) => (key === "token" ? "reset-token-123" : null));
    const spy = vi.spyOn(authApi, "resetPassword");

    render(<ResetPasswordPage />);
    typePasswords("CompliantPassword123!", "CompliantPassword321!");
    fireEvent.click(screen.getByRole("button", { name: AUTH_STRINGS.resetPassword.submitBtn }));

    expect(spy).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: AUTH_STRINGS.resetPassword.submitBtn }),
    ).toBeDisabled();
  });

  it("blocks passwords that fail the policy", () => {
    mockGet.mockImplementation((key: string) => (key === "token" ? "reset-token-123" : null));
    const spy = vi.spyOn(authApi, "resetPassword");

    render(<ResetPasswordPage />);
    typePasswords("weakpassword");
    fireEvent.click(screen.getByRole("button", { name: AUTH_STRINGS.resetPassword.submitBtn }));

    expect(spy).not.toHaveBeenCalled();
  });

  it("resets the password and shows a sign-in-only success state", async () => {
    mockGet.mockImplementation((key: string) => (key === "token" ? "reset-token-123" : null));
    const spy = vi.spyOn(authApi, "resetPassword").mockResolvedValue({ status: true });

    render(<ResetPasswordPage />);
    typePasswords("CompliantPassword123!");
    fireEvent.click(screen.getByRole("button", { name: AUTH_STRINGS.resetPassword.submitBtn }));

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({
        token: "reset-token-123",
        password: "CompliantPassword123!",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: AUTH_STRINGS.resetPassword.successTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: new RegExp(AUTH_STRINGS.resetPassword.backToSignIn, "i") }),
    ).toHaveAttribute("href", "/login");
    expect(screen.queryByText(/account is now fully active/i)).not.toBeInTheDocument();
  });

  it("treats an expired token as recoverable instead of a dead end", async () => {
    mockGet.mockImplementation((key: string) => (key === "token" ? "expired-token" : null));
    vi.spyOn(authApi, "resetPassword").mockRejectedValue(
      new OperixApiError("invalid token", {
        status: 400,
        code: "INVALID_TOKEN",
      }),
    );

    render(<ResetPasswordPage />);
    typePasswords("CompliantPassword123!");
    fireEvent.click(screen.getByRole("button", { name: AUTH_STRINGS.resetPassword.submitBtn }));

    expect(
      await screen.findByRole("heading", { name: AUTH_STRINGS.resetPassword.invalidTokenTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: new RegExp(AUTH_STRINGS.resetPassword.requestNewLink, "i"),
      }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("keeps the form available when the reset fails for another reason", async () => {
    mockGet.mockImplementation((key: string) => (key === "token" ? "reset-token-123" : null));
    vi.spyOn(authApi, "resetPassword").mockRejectedValue(
      new OperixApiError("server unavailable", {
        status: 503,
        code: "SERVICE_UNAVAILABLE",
      }),
    );

    render(<ResetPasswordPage />);
    typePasswords("CompliantPassword123!");
    fireEvent.click(screen.getByRole("button", { name: AUTH_STRINGS.resetPassword.submitBtn }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/server unavailable/i);
    expect(
      screen.queryByRole("heading", { name: AUTH_STRINGS.resetPassword.successTitle }),
    ).not.toBeInTheDocument();
  });
});
