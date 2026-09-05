import { afterEach, describe, expect, it, vi } from "vitest";
import { adminApi } from "@/features/admins/api/admin.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("adminApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Admins with only page and limit", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await adminApi.list({ page: 1, limit: 20 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/admins?page=1&limit=20",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });

  it("gets Admin details by id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "admin-1" }));

    await adminApi.getById("admin-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/admins/admin-1",
    );
  });

  it("creates Admins without role, status, or id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "admin-1" }));

    await adminApi.create({
      name: "Admin A",
      email: "admin@example.com",
      initialPassword: "Password123!",
      designation: "Manager",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(JSON.parse(String(request.body))).toEqual({
      name: "Admin A",
      email: "admin@example.com",
      initialPassword: "Password123!",
      designation: "Manager",
    });
    expect(String(request.body)).not.toContain("role");
    expect(String(request.body)).not.toContain("status");
    expect(String(request.body)).not.toContain("id");
  });

  it("updates Admins without immutable fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "admin-1" }));

    await adminApi.update("admin-1", {
      designation: "Operations Lead",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/admins/admin-1",
    );
    expect(JSON.parse(String(request.body))).toEqual({
      designation: "Operations Lead",
    });
  });

  it("updates Admin status with PATCH and canonical status", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "admin-1" }));

    await adminApi.updateStatus("admin-1", { status: "SUSPENDED" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/admins/admin-1/status",
    );
    expect(JSON.parse(String(request.body))).toEqual({
      status: "SUSPENDED",
    });
  });
});
