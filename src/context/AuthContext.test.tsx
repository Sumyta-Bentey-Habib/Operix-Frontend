import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { OperixApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  getMe: vi.fn(),
  signIn: vi.fn(),
  getSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/features/auth/api/viewerApi", () => ({
  viewerApi: {
    getMe: mocks.getMe,
  },
}));

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    signIn: mocks.signIn,
    getSession: mocks.getSession,
    signOut: mocks.signOut,
  },
}));

const viewer = {
  userId: "user-1",
  role: "ADMIN" as const,
  status: "ACTIVE" as const,
  scope: { type: "ADMIN" as const, teamIds: ["team-1"] },
};

const Probe = () => {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="status">{auth.hydrationStatus}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="viewer">{auth.viewer?.userId ?? "none"}</div>
      <div data-testid="profile">{auth.profile?.email ?? "none"}</div>
      <div data-testid="error">{auth.hydrationError?.code ?? "none"}</div>
      <button
        type="button"
        onClick={() =>
          void auth
            .signIn("admin@example.com", "secret", {
              rememberMe: false,
            })
            .catch(() => undefined)
        }
      >
        sign in
      </button>
      <button type="button" onClick={() => void auth.signOut()}>
        sign out
      </button>
      <button type="button" onClick={() => void auth.retryHydration()}>
        retry
      </button>
    </div>
  );
};

const renderAuth = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
    });
    mocks.signIn.mockResolvedValue({});
    mocks.signOut.mockResolvedValue({});
  });

  it("authenticates from /viewer/me and hydrates optional profile", async () => {
    mocks.getMe.mockResolvedValueOnce(viewer);
    renderAuth();

    expect(screen.getByTestId("status")).toHaveTextContent("LOADING");

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("AUTHENTICATED"));

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("viewer")).toHaveTextContent("user-1");
    expect(screen.getByTestId("profile")).toHaveTextContent("admin@example.com");
  });

  it("clears viewer on 401 AUTH_REQUIRED", async () => {
    mocks.getMe.mockRejectedValueOnce(
      new OperixApiError("Auth required", {
        status: 401,
        code: "AUTH_REQUIRED",
      }),
    );

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("UNAUTHENTICATED"));

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("viewer")).toHaveTextContent("none");
  });

  it("keeps boot network failure retryable without declaring logout", async () => {
    mocks.getMe.mockRejectedValueOnce(
      new OperixApiError("Network", {
        status: 0,
        code: "NETWORK_ERROR",
      }),
    );

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("ERROR"));

    expect(screen.getByTestId("error")).toHaveTextContent("NETWORK_ERROR");
  });

  it("does not invalidate viewer when profile hydration fails", async () => {
    mocks.getMe.mockResolvedValueOnce(viewer);
    mocks.getSession.mockRejectedValueOnce(new Error("profile failed"));

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("AUTHENTICATED"));

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("profile")).toHaveTextContent("none");
  });

  it("signs in before hydrating viewer and profile", async () => {
    mocks.getMe
      .mockRejectedValueOnce(
        new OperixApiError("Auth required", {
          status: 401,
          code: "AUTH_REQUIRED",
        }),
      )
      .mockResolvedValueOnce(viewer);

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("UNAUTHENTICATED"));

    await act(async () => {
      screen.getByText("sign in").click();
    });

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("AUTHENTICATED"));

    expect(mocks.signIn).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "secret",
      rememberMe: false,
    });
    expect(mocks.getSession).toHaveBeenCalled();
  });

  it("does not authenticate when viewer hydration fails after sign in", async () => {
    mocks.getMe
      .mockRejectedValueOnce(
        new OperixApiError("Auth required", {
          status: 401,
          code: "AUTH_REQUIRED",
        }),
      )
      .mockRejectedValueOnce(
        new OperixApiError("Forbidden", {
          status: 403,
          code: "FORBIDDEN",
        }),
      );

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("UNAUTHENTICATED"));

    await act(async () => {
      screen.getByText("sign in").click();
    });

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("false"));
    expect(mocks.signOut).toHaveBeenCalled();
  });

  it("clears viewer on successful sign out", async () => {
    mocks.getMe.mockResolvedValueOnce(viewer);
    renderAuth();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("AUTHENTICATED"));

    await act(async () => {
      screen.getByText("sign out").click();
    });

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("UNAUTHENTICATED"));
  });

  it("preserves an existing viewer during background refresh failure", async () => {
    mocks.getMe.mockResolvedValueOnce(viewer).mockRejectedValueOnce(
      new OperixApiError("Server failed", {
        status: 500,
        code: "SERVER_ERROR",
      }),
    );

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("AUTHENTICATED"));

    await act(async () => {
      screen.getByText("retry").click();
    });

    await waitFor(() => expect(screen.getByTestId("error")).toHaveTextContent("SERVER_ERROR"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("viewer")).toHaveTextContent("user-1");
  });
});
