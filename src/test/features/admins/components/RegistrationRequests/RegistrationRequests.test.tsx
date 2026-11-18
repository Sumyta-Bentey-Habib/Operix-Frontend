import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { RegistrationRequests } from "@/features/admins/components/RegistrationRequests/RegistrationRequests";
import { registrationApi } from "@/features/auth/api/registrationApi";
import type { RegistrationRequest } from "@/features/auth/types/registration.types";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import { OperixApiError } from "@/lib/api";

const baseRequest = {
  publicId: undefined,
  selectedRole: null,
  selectedEmployeeId: null,
  selectedDesignation: null,
  selectedTeam: null,
  reviewer: null,
  rejectionReason: null,
  reviewedAt: null,
  approvedAt: null,
  passwordConfiguredAt: null,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
};

const pendingRequest: RegistrationRequest = {
  ...baseRequest,
  id: "req-1",
  name: "Dr. Sarah Rahman",
  email: "sarah.rahman@operix.com",
  status: "PENDING",
  selectedDesignation: "QA Officer",
  selectedEmployeeId: "EMP-101",
};

const approvedPendingSetup: RegistrationRequest = {
  ...baseRequest,
  id: "req-2",
  name: "Arnab Dey",
  email: "arnab@operix.com",
  status: "APPROVED",
  selectedRole: "MEMBER",
  selectedEmployeeId: "EMP-001",
  approvedAt: "2026-11-18T00:00:00Z",
};

const approvedCompletedSetup: RegistrationRequest = {
  ...baseRequest,
  id: "req-3",
  name: "Nusrat Jahan",
  email: "nusrat@operix.com",
  status: "APPROVED",
  selectedRole: "ADMIN",
  selectedEmployeeId: "EMP-002",
  approvedAt: "2026-11-10T00:00:00Z",
  passwordConfiguredAt: "2026-11-11T00:00:00Z",
};

const page = (data: RegistrationRequest[]) => ({
  data,
  meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
});

const openApprovedTab = () => {
  fireEvent.click(screen.getByRole("tab", { name: AUTH_STRINGS.adminApproval.approvedTabLabel }));
};

describe("RegistrationRequests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders pending requests mapped from backend field names", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValueOnce(page([pendingRequest]));

    render(<RegistrationRequests />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Sarah Rahman")).toBeInTheDocument();
      expect(screen.getByText("sarah.rahman@operix.com")).toBeInTheDocument();
      expect(screen.getByText("QA Officer")).toBeInTheDocument();
      expect(screen.getByText("EMP-101")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Review & Decide Role/i })).toBeInTheDocument();
    });
  });

  it("queries the backend with the server-side status of the active tab", async () => {
    const listSpy = vi
      .spyOn(registrationApi, "listRequests")
      .mockResolvedValueOnce(page([pendingRequest]))
      .mockResolvedValueOnce(page([approvedPendingSetup]));

    render(<RegistrationRequests />);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        { status: "PENDING" },
        { signal: expect.any(AbortSignal) as AbortSignal },
      );
    });

    openApprovedTab();

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        { status: "APPROVED" },
        { signal: expect.any(AbortSignal) as AbortSignal },
      );
    });
  });

  it("opens approval dialog when review button is clicked", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValueOnce(page([pendingRequest]));

    render(<RegistrationRequests />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Review & Decide Role/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Review & Decide Role/i }));

    expect(screen.getByText(/Assign Organization Role/i)).toBeInTheDocument();
  });

  it("shows password setup state and hides resend once setup is completed", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValue(
      page([approvedPendingSetup, approvedCompletedSetup]),
    );

    render(<RegistrationRequests />);
    openApprovedTab();

    await waitFor(() => {
      expect(screen.getByText("Arnab Dey")).toBeInTheDocument();
    });

    const pendingRow = screen.getByText("Arnab Dey").closest("tr");
    const completedRow = screen.getByText("Nusrat Jahan").closest("tr");
    expect(pendingRow).not.toBeNull();
    expect(completedRow).not.toBeNull();
    expect(
      within(pendingRow as HTMLElement).getByText(AUTH_STRINGS.adminApproval.passwordSetupPending),
    ).toBeInTheDocument();
    expect(
      within(completedRow as HTMLElement).getByText(
        AUTH_STRINGS.adminApproval.passwordSetupCompleted,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", {
        name: AUTH_STRINGS.adminApproval.resendAction,
      }),
    ).toHaveLength(1);
  });

  it("reports accepted delivery and starts the cooldown for that row only", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValue(
      page([approvedPendingSetup, { ...approvedCompletedSetup, passwordConfiguredAt: null }]),
    );
    const resendSpy = vi.spyOn(registrationApi, "resendSetup").mockResolvedValueOnce({
      message: "A new account setup link was requested.",
      setupEmail: { status: "ACCEPTED" },
    });

    render(<RegistrationRequests />);
    openApprovedTab();

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", {
          name: AUTH_STRINGS.adminApproval.resendAction,
        }),
      ).toHaveLength(2);
    });

    const [firstResend] = screen.getAllByRole("button", {
      name: AUTH_STRINGS.adminApproval.resendAction,
    });
    fireEvent.click(firstResend);

    await waitFor(() => {
      expect(resendSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Resend available in 60s")).toBeInTheDocument();
    });
    expect(screen.getByText(AUTH_STRINGS.adminApproval.resendAccepted)).toBeInTheDocument();

    // The second employee is unaffected and can still be resent.
    expect(
      screen.getAllByRole("button", {
        name: AUTH_STRINGS.adminApproval.resendAction,
      }),
    ).toHaveLength(1);
  });

  it("surfaces a warning and keeps the action retryable when delivery fails", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValue(page([approvedPendingSetup]));
    vi.spyOn(registrationApi, "resendSetup").mockResolvedValueOnce({
      message: "A new account setup link was requested.",
      setupEmail: { status: "FAILED" },
    });

    render(<RegistrationRequests />);
    openApprovedTab();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: AUTH_STRINGS.adminApproval.resendAction,
        }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: AUTH_STRINGS.adminApproval.resendAction,
      }),
    );

    await waitFor(() => {
      expect(screen.getAllByText(AUTH_STRINGS.adminApproval.resendFailed).length).toBeGreaterThan(
        0,
      );
    });
    expect(
      screen.getByRole("button", {
        name: AUTH_STRINGS.adminApproval.resendAction,
      }),
    ).toBeEnabled();
  });

  it("honours the server cooldown retry window on 429", async () => {
    vi.spyOn(registrationApi, "listRequests").mockResolvedValue(page([approvedPendingSetup]));
    vi.spyOn(registrationApi, "resendSetup").mockRejectedValueOnce(
      new OperixApiError("A setup email was requested recently.", {
        status: 429,
        code: "REGISTRATION_SETUP_RESEND_COOLDOWN",
        details: { retryAfterSeconds: 42 },
      }),
    );

    render(<RegistrationRequests />);
    openApprovedTab();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: AUTH_STRINGS.adminApproval.resendAction,
        }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: AUTH_STRINGS.adminApproval.resendAction,
      }),
    );

    await waitFor(() => {
      expect(screen.getAllByText("Resend available in 42s").length).toBeGreaterThan(0);
    });
  });

  it("reports the truthful approval outcome instead of claiming delivery", async () => {
    vi.spyOn(registrationApi, "listRequests")
      .mockResolvedValueOnce(page([pendingRequest]))
      .mockResolvedValue(page([]));
    vi.spyOn(registrationApi, "approveRequest").mockResolvedValueOnce({
      ...pendingRequest,
      status: "APPROVED",
      setupEmail: { status: "FAILED" },
    });

    render(<RegistrationRequests />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Review & Decide Role/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Review & Decide Role/i }));
    fireEvent.click(screen.getByRole("button", { name: /Approve & Send Password Setup Email/i }));

    await waitFor(() => {
      expect(screen.getByText(AUTH_STRINGS.adminApproval.approvalFailed)).toBeInTheDocument();
    });
    expect(screen.queryByText(AUTH_STRINGS.adminApproval.approvalAccepted)).not.toBeInTheDocument();
  });
});
