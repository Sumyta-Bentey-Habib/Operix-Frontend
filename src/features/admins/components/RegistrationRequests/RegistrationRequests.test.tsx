import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RegistrationRequests } from "./RegistrationRequests";
import { registrationApi } from "@/features/auth/api/registrationApi";

const mockRequests = [
  {
    id: "req-1",
    name: "Dr. Sarah Rahman",
    email: "sarah.rahman@operix.com",
    employeeId: "EMP-101",
    designation: "QA Officer",
    status: "PENDING" as const,
    rejectionReason: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  },
];

describe("RegistrationRequests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders table when pending requests exist", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValueOnce({
      data: mockRequests,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    render(<RegistrationRequests />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Sarah Rahman")).toBeInTheDocument();
      expect(screen.getByText("sarah.rahman@operix.com")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Review & Decide Role/i })).toBeInTheDocument();
    });
  });

  it("opens approval dialog when review button is clicked", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValueOnce({
      data: mockRequests,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    render(<RegistrationRequests />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Review & Decide Role/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Review & Decide Role/i }));

    expect(screen.getByText(/Assign Organization Role/i)).toBeInTheDocument();
  });
});
