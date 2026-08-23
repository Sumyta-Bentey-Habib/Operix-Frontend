import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationBell } from "./NotificationBell";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("NotificationBell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthMock.mockReset();
  });

  it("does not read notifications before auth hydration is authenticated", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    useAuthMock.mockReturnValue({ hydrationStatus: "LOADING" });

    render(<NotificationBell />);
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
  });

  it("shows unread count and refreshes latest preview when opened", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ count: 3 }))
      .mockResolvedValueOnce(
        jsonResponse({ data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } }),
      )
      .mockResolvedValueOnce(jsonResponse({ count: 3 }))
      .mockResolvedValueOnce(
        jsonResponse({ data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } }),
      );
    useAuthMock.mockReturnValue({ hydrationStatus: "AUTHENTICATED" });

    render(<NotificationBell />);

    expect(await screen.findByText("3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));

    expect(await screen.findByText("No Notifications yet.")).toBeInTheDocument();
    expect(String(fetchMock.mock.calls[3]?.[0])).toBe(
      "http://localhost:5000/api/v1/notifications?page=1&limit=5",
    );
  });
});
