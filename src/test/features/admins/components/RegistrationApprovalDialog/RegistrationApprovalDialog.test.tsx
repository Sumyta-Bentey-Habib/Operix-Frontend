import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RegistrationApprovalDialog } from "@/features/admins/components/RegistrationApprovalDialog/RegistrationApprovalDialog";
import type { RegistrationRequest } from "@/features/auth/types/registration.types";

const mockRequest: RegistrationRequest = {
  id: "req-1",
  name: "Dr. Sarah Rahman",
  email: "sarah.rahman@operix.com",
  employeeId: "EMP-101",
  designation: "QA Officer",
  status: "PENDING",
  rejectionReason: null,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
};

describe("RegistrationApprovalDialog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders applicant info and role options", () => {
    render(
      <RegistrationApprovalDialog request={mockRequest} onApprove={vi.fn()} onClose={vi.fn()} />,
    );

    expect(screen.getByText("Dr. Sarah Rahman")).toBeInTheDocument();
    expect(screen.getByText("sarah.rahman@operix.com")).toBeInTheDocument();
    expect(screen.getByText(/Admin \/ Team Lead/i)).toBeInTheDocument();
    expect(screen.getByText(/Member \/ Staff/i)).toBeInTheDocument();
  });

  it("calls onApprove with selected role and details", async () => {
    const handleApprove = vi.fn();
    render(
      <RegistrationApprovalDialog
        request={mockRequest}
        onApprove={handleApprove}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/Admin \/ Team Lead/i));
    fireEvent.click(screen.getByRole("button", { name: /Approve & Send Password Setup Email/i }));

    expect(handleApprove).toHaveBeenCalledWith("req-1", {
      role: "ADMIN",
      employeeId: "EMP-101",
      designation: "QA Officer",
      teamId: null,
    });
  });
});
