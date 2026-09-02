import { describe, it, expect, vi, beforeEach } from "vitest";
import { registrationApi } from "./registrationApi";
import * as apiModule from "@/lib/api";

describe("registrationApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits a signup request successfully", async () => {
    const spy = vi.spyOn(apiModule, "apiRequest").mockResolvedValueOnce({
      message: "Request submitted.",
      requestId: "req-123",
    });

    const result = await registrationApi.submitSignupRequest({
      name: "Dr. Sarah",
      email: "sarah@operix.test",
      designation: "Quality Specialist",
    });

    expect(spy).toHaveBeenCalledWith("/registration-requests", {
      method: "POST",
      json: {
        name: "Dr. Sarah",
        email: "sarah@operix.test",
      },
      signal: undefined,
    });
    expect(result.requestId).toBe("req-123");
  });

  it("lists pending registration requests with query parameters", async () => {
    const mockResponse = {
      data: [
        {
          id: "req-1",
          name: "Dr. Sarah",
          email: "sarah@operix.test",
          status: "PENDING",
          employeeId: null,
          designation: "QA",
          rejectionReason: null,
          createdAt: "2026-09-01T00:00:00Z",
          updatedAt: "2026-09-01T00:00:00Z",
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    const spy = vi.spyOn(apiModule, "apiRequest").mockResolvedValueOnce(mockResponse);

    const result = await registrationApi.listRequests({ page: 1, limit: 10, status: "PENDING" });

    expect(spy).toHaveBeenCalledWith("/registration-requests", {
      query: { page: 1, limit: 10, status: "PENDING" },
      signal: undefined,
    });
    expect(result.data).toHaveLength(1);
  });

  it("approves a registration request with assigned role and details", async () => {
    const spy = vi.spyOn(apiModule, "apiRequest").mockResolvedValueOnce({
      success: true,
      message: "Approved",
    });

    await registrationApi.approveRequest("req-1", {
      role: "ADMIN",
      employeeId: "ADM-100",
      designation: "Lead Specialist",
    });

    expect(spy).toHaveBeenCalledWith("/registration-requests/req-1/approve", {
      method: "POST",
      json: {
        role: "ADMIN",
        employeeId: "ADM-100",
        designation: "Lead Specialist",
      },
      signal: undefined,
    });
  });

  it("rejects a registration request", async () => {
    const spy = vi.spyOn(apiModule, "apiRequest").mockResolvedValueOnce({
      success: true,
      message: "Rejected",
    });

    await registrationApi.rejectRequest("req-1", { reason: "Not eligible" });

    expect(spy).toHaveBeenCalledWith("/registration-requests/req-1/reject", {
      method: "POST",
      json: { reason: "Not eligible" },
      signal: undefined,
    });
  });

  it("sets up password using token", async () => {
    const spy = vi.spyOn(apiModule, "apiRequest").mockResolvedValueOnce({
      success: true,
      message: "Password configured.",
    });

    await registrationApi.setupPassword({
      token: "secret-token-xyz",
      password: "StrongPassword123!",
    });

    expect(spy).toHaveBeenCalledWith("/auth/reset-password", {
      method: "POST",
      json: {
        token: "secret-token-xyz",
        newPassword: "StrongPassword123!",
      },
      signal: undefined,
    });
  });
});
