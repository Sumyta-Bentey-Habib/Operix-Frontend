import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SetupPasswordPage } from "./SetupPasswordPage";
import { registrationApi } from "../../api/registrationApi";

const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("SetupPasswordPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("displays invalid token message when no token is in URL", () => {
    mockGet.mockReturnValue(null);
    render(<SetupPasswordPage />);

    expect(screen.getByText(/Invalid or Expired Link/i)).toBeInTheDocument();
  });

  it("renders the password form and live checklist when token is provided", () => {
    mockGet.mockReturnValue("valid-token-123");
    render(<SetupPasswordPage />);

    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Security Requirements/i)).toBeInTheDocument();
    expect(screen.getByText(/At least 8 characters long/i)).toBeInTheDocument();
  });

  it("submits compliant password and shows success state", async () => {
    mockGet.mockReturnValue("valid-token-123");
    vi.spyOn(registrationApi, "setupPassword").mockResolvedValueOnce({
      success: true,
      message: "Password set.",
    });

    render(<SetupPasswordPage />);

    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: "CompliantPassword123!" },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm Password/i), {
      target: { value: "CompliantPassword123!" },
    });

    const submitBtn = screen.getByRole("button", { name: /Activate Account & Set Password/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Password Set Successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/Proceed to Sign In/i)).toBeInTheDocument();
    });
  });
});
