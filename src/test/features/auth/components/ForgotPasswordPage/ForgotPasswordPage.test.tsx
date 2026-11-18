import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordPage } from "@/features/auth/components/ForgotPasswordPage/ForgotPasswordPage";
import { authApi } from "@/features/auth/api/authApi";
import { OperixApiError } from "@/lib/api";
import { AUTH_STRINGS } from "@/constants/auth-strings";

const submitResetRequest = () => {
  fireEvent.click(screen.getByRole("button", { name: AUTH_STRINGS.forgotPassword.submitBtn }));
};

const typeEmail = (value: string) => {
  fireEvent.change(screen.getByLabelText(AUTH_STRINGS.forgotPassword.emailLabel), {
    target: { value },
  });
};

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the self-service request form and links back to sign in", () => {
    render(<ForgotPasswordPage />);

    expect(
      screen.getByRole("heading", { name: AUTH_STRINGS.forgotPassword.title }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_STRINGS.forgotPassword.emailLabel)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: AUTH_STRINGS.forgotPassword.backToSignIn }),
    ).toHaveAttribute("href", "/login");
    expect(screen.queryByText(/contact your Operix IT Administrator/i)).not.toBeInTheDocument();
  });

  it("rejects an invalid email without calling the API", () => {
    const spy = vi.spyOn(authApi, "requestPasswordReset");

    render(<ForgotPasswordPage />);
    typeEmail("not-an-email");
    submitResetRequest();

    expect(screen.getByRole("alert")).toHaveTextContent(
      AUTH_STRINGS.forgotPassword.errors.invalidEmail,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("posts the trimmed email with a /reset-password redirect", async () => {
    const spy = vi.spyOn(authApi, "requestPasswordReset").mockResolvedValue({ status: true });

    render(<ForgotPasswordPage />);
    typeEmail("  arnab@operix.com  ");
    submitResetRequest();

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        "arnab@operix.com",
        `${window.location.origin}/reset-password`,
      ),
    );
  });

  it("shows the same generic confirmation for known and unknown addresses", async () => {
    const spy = vi
      .spyOn(authApi, "requestPasswordReset")
      .mockResolvedValue({ status: true, message: "If this email exists..." });

    render(<ForgotPasswordPage />);
    typeEmail("known-user@operix.com");
    submitResetRequest();

    await waitFor(() =>
      expect(screen.getByText(AUTH_STRINGS.forgotPassword.confirmationMessage)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: AUTH_STRINGS.forgotPassword.confirmationTitle }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/not found/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/does not exist/i)).not.toBeInTheDocument();

    // A second request for an unknown address renders the identical screen.
    render(<ForgotPasswordPage />);
    typeEmail("unknown-user@example.com");
    submitResetRequest();

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        "unknown-user@example.com",
        `${window.location.origin}/reset-password`,
      ),
    );
    expect(
      screen.getAllByText(AUTH_STRINGS.forgotPassword.confirmationMessage).length,
    ).toBeGreaterThan(0);
  });

  it("keeps the form available with a safe retry message when the request fails", async () => {
    vi.spyOn(authApi, "requestPasswordReset").mockRejectedValue(
      new OperixApiError("provider unavailable", {
        status: 503,
        code: "MAIL_DELIVERY_UNAVAILABLE",
      }),
    );

    render(<ForgotPasswordPage />);
    typeEmail("arnab@operix.com");
    submitResetRequest();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      AUTH_STRINGS.forgotPassword.errors.genericFailure,
    );
    expect(
      screen.queryByText(AUTH_STRINGS.forgotPassword.confirmationMessage),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: AUTH_STRINGS.forgotPassword.submitBtn }),
    ).toBeEnabled();
  });
});
