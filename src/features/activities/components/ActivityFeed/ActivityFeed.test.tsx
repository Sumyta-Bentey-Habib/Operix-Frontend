import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActivityFeed } from "./ActivityFeed";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("ActivityFeed", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthMock.mockReset();
  });

  it("renders backend Activity records without actor hydration", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            id: "activity-1",
            actorId: null,
            action: "SOME_FUTURE_ACTION",
            entityType: "UNKNOWN_ENTITY",
            entityId: "entity-1",
            metadata: { nested: { ok: true } },
            createdAt: "2026-08-23T00:00:00.000Z",
            actor: null,
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    );
    useAuthMock.mockReturnValue({
      viewer: {
        userId: "member-1",
        role: "MEMBER",
        status: "ACTIVE",
        scope: { type: "MEMBER", teamId: "team-1" },
      },
    });

    render(<ActivityFeed />);

    expect(await screen.findByText("Some Future Action")).toBeInTheDocument();
    expect(screen.getByText(/System/)).toBeInTheDocument();
    expect(screen.getByText("UNKNOWN_ENTITY")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the current feed and sends no request for an invalid date draft", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
    );
    useAuthMock.mockReturnValue({
      viewer: {
        userId: "admin-1",
        role: "ADMIN",
        status: "ACTIVE",
        scope: { type: "ADMIN", teamIds: ["team-1"] },
      },
    });

    render(<ActivityFeed />);
    await screen.findByText("No activities found");

    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-08-24T10:00" } });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-08-23T10:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText("From must be earlier than or equal to To.")).toBeInTheDocument();
    expect(screen.getByText("No activities found")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});
