import { apiRequest } from "@/lib/api";
import type { AuthProfile } from "@/types/auth";

interface BetterAuthSessionResponse {
  user?: {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    image?: unknown;
  } | null;
}

const toAuthProfile = (value: unknown): AuthProfile | null => {
  if (!value || typeof value !== "object") return null;

  const user = (value as BetterAuthSessionResponse).user;
  if (!user || typeof user !== "object" || typeof user.id !== "string") {
    return null;
  }

  return {
    id: user.id,
    name: typeof user.name === "string" ? user.name : null,
    email: typeof user.email === "string" ? user.email : null,
    image: typeof user.image === "string" ? user.image : null,
  };
};

export const authApi = {
  signIn: (input: { email: string; password: string; rememberMe?: boolean }): Promise<unknown> =>
    apiRequest("/auth/sign-in/email", {
      method: "POST",
      json: input,
    }),

  /**
   * Requests a self-service password reset link.
   *
   * Better Auth answers generically for known and unknown addresses alike, so
   * the caller must never branch its copy on the response.
   */
  requestPasswordReset: (email: string, redirectTo: string): Promise<unknown> =>
    apiRequest("/auth/request-password-reset", {
      method: "POST",
      json: { email, redirectTo },
    }),

  /** Completes a password reset or first-time setup with a Better Auth token. */
  resetPassword: (input: { token: string; password: string }): Promise<unknown> =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      json: {
        token: input.token,
        newPassword: input.password,
      },
    }),

  getSession: async (): Promise<AuthProfile | null> => {
    const response = await apiRequest<unknown>("/auth/get-session");
    return toAuthProfile(response);
  },

  signOut: (): Promise<unknown> =>
    apiRequest("/auth/sign-out", {
      method: "POST",
    }),
};
