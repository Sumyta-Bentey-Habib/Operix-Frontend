import { afterEach, describe, expect, it, vi } from "vitest";
import { authApi } from "@/features/auth/api/authApi";
import { viewerApi } from "@/features/auth/api/viewerApi";
import { healthApi } from "@/features/health/api/healthApi";

const response = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("auth and viewer APIs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the exact backend endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => response({ ok: true }));

    await authApi.signIn({
      email: "admin@example.com",
      password: "secret",
      rememberMe: false,
    });
    await authApi.getSession();
    await authApi.signOut();
    await healthApi.get();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      response({
        userId: "user-1",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        scope: { type: "GLOBAL" },
      }),
    );
    await viewerApi.getMe();

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "http://localhost:5000/api/v1/auth/sign-in/email",
      "http://localhost:5000/api/v1/auth/get-session",
      "http://localhost:5000/api/v1/auth/sign-out",
      "http://localhost:5000/api/v1/health",
      "http://localhost:5000/api/v1/viewer/me",
    ]);
  });

  it("preserves every viewer role and scope shape exactly", async () => {
    const viewers = [
      {
        userId: "super",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        scope: { type: "GLOBAL" },
      },
      {
        userId: "admin",
        role: "ADMIN",
        status: "INACTIVE",
        scope: { type: "ADMIN", teamIds: ["team-1"] },
      },
      {
        userId: "member",
        role: "MEMBER",
        status: "SUSPENDED",
        scope: { type: "MEMBER", teamId: null },
      },
    ];

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(viewers[0]))
      .mockResolvedValueOnce(response(viewers[1]))
      .mockResolvedValueOnce(response(viewers[2]));

    await expect(viewerApi.getMe()).resolves.toEqual(viewers[0]);
    await expect(viewerApi.getMe()).resolves.toEqual(viewers[1]);
    await expect(viewerApi.getMe()).resolves.toEqual(viewers[2]);
  });
});
