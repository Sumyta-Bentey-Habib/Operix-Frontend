import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import type { OperixViewer } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock("@/features/documents/api/document.api", () => ({
  documentApi: { list: mocks.list },
}));

const memberViewer: OperixViewer = {
  userId: "member-user-1",
  role: "MEMBER",
  status: "ACTIVE",
  scope: { type: "MEMBER", teamId: "team-1" },
};

describe("useDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  it("fetches with default filters and first page", async () => {
    const { result } = renderHook(() => useDocuments(memberViewer));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mocks.list).toHaveBeenCalledWith(
      { page: 1, limit: 20, sort: "CREATED_AT_DESC" },
      { signal: expect.anything() },
    );
  });

  it("applies draft filters and resets to page one", async () => {
    const { result } = renderHook(() => useDocuments(memberViewer));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setDraftFilters((current) => ({ ...current, search: "Lab" }));
    });
    act(() => {
      result.current.applyFilters();
    });

    await waitFor(() =>
      expect(mocks.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "Lab" }),
        expect.anything(),
      ),
    );
  });

  it("resets filters and page", async () => {
    const { result } = renderHook(() => useDocuments(memberViewer));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setDraftFilters((current) => ({
        ...current,
        source: "TASK_ATTACHMENT",
      }));
    });
    act(() => {
      result.current.applyFilters();
    });
    act(() => {
      result.current.resetFilters();
    });

    await waitFor(() =>
      expect(mocks.list).toHaveBeenLastCalledWith(
        { page: 1, limit: 20, sort: "CREATED_AT_DESC" },
        expect.anything(),
      ),
    );
  });
});
