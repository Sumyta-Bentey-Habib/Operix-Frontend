import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignUpPage } from "@/features/auth/components/SignUpPage/SignUpPage";
import { registrationApi } from "@/features/auth/api/registrationApi";

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the sign-up request form with fields", () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Requested Designation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Access Request/i })).toBeInTheDocument();
  });

  it("validates empty name or email submission", async () => {
    render(<SignUpPage />);

    const submitBtn = screen.getByRole("button", { name: /Submit Access Request/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("button", { name: /Submit Access Request/i })).toBeInTheDocument();
  });

  it("submits the access request and displays success confirmation", async () => {
    vi.spyOn(registrationApi, "submitSignupRequest").mockResolvedValueOnce({
      message: "Submitted",
      requestId: "req-1",
    });

    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Dr. Sarah Rahman" },
    });
    fireEvent.change(screen.getByLabelText(/Work Email/i), {
      target: { value: "sarah.rahman@operix.com" },
    });
    fireEvent.change(screen.getByLabelText(/Requested Designation/i), {
      target: { value: "QA Lead" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit Access Request/i }));

    await waitFor(() => {
      expect(screen.getByText(/Access Request Submitted/i)).toBeInTheDocument();
      expect(screen.getByText("Dr. Sarah Rahman")).toBeInTheDocument();
      expect(screen.getByText("sarah.rahman@operix.com")).toBeInTheDocument();
      expect(screen.getByText(/Return to Sign In/i)).toBeInTheDocument();
    });
  });
});
