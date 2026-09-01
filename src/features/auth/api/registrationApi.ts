import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  ApproveRegistrationInput,
  RegistrationRequest,
  RejectRegistrationInput,
  SetupPasswordInput,
  SignupRequestInput,
} from "../types/registration.types";

export const registrationApi = {
  submitSignupRequest: (
    input: SignupRequestInput,
    options?: { signal?: AbortSignal },
  ): Promise<{ message: string; requestId?: string }> =>
    apiRequest("/registration-requests", {
      method: "POST",
      json: {
        name: input.name,
        email: input.email,
      },
      signal: options?.signal,
    }),

  listRequests: (
    params?: { page?: number; limit?: number; status?: string; q?: string },
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<RegistrationRequest>> =>
    apiRequest("/registration-requests", {
      query: {
        page: params?.page,
        limit: params?.limit,
        status: params?.status,
        q: params?.q,
      },
      signal: options?.signal,
    }),

  getRequest: (
    requestId: string,
    options?: { signal?: AbortSignal },
  ): Promise<RegistrationRequest> =>
    apiRequest(`/registration-requests/${encodeURIComponent(requestId)}`, {
      method: "GET",
      signal: options?.signal,
    }),

  approveRequest: (
    requestId: string,
    input: ApproveRegistrationInput,
    options?: { signal?: AbortSignal },
  ): Promise<{ success?: boolean; message?: string }> =>
    apiRequest(`/registration-requests/${encodeURIComponent(requestId)}/approve`, {
      method: "POST",
      json: {
        role: input.role,
        employeeId: input.employeeId || undefined,
        designation: input.designation || undefined,
        teamId: input.teamId || undefined,
      },
      signal: options?.signal,
    }),

  rejectRequest: (
    requestId: string,
    input: RejectRegistrationInput,
    options?: { signal?: AbortSignal },
  ): Promise<{ success?: boolean; message?: string }> =>
    apiRequest(`/registration-requests/${encodeURIComponent(requestId)}/reject`, {
      method: "POST",
      json: {
        reason: input.reason || "Registration request rejected by administrator.",
      },
      signal: options?.signal,
    }),

  setupPassword: (
    input: SetupPasswordInput,
    options?: { signal?: AbortSignal },
  ): Promise<{ success?: boolean; message?: string }> =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      json: {
        newPassword: input.password,
        token: input.token,
      },
      signal: options?.signal,
    }),
};
