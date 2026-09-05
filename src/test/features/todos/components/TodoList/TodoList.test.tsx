import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TodoList } from "@/features/todos/components/TodoList/TodoList";
import type { OperixViewer } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

describe("TodoList", () => {
  const adminViewer: OperixViewer = {
    userId: "admin-list-test",
    role: "ADMIN",
    status: "ACTIVE",
    scope: { type: "ADMIN", teamIds: ["team-1"] },
  };

  const memberViewer: OperixViewer = {
    userId: "member-list-test",
    role: "MEMBER",
    status: "ACTIVE",
    scope: { type: "MEMBER", teamId: "team-1" },
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows unauthorized alert for non-admin users", () => {
    mocks.useAuth.mockReturnValue({
      viewer: memberViewer,
      isLoading: false,
    });

    render(<TodoList />);
    expect(
      screen.getByText("Only administrators can access the admin todo list."),
    ).toBeInTheDocument();
  });

  it("renders header, stats, and handles quick task addition for admin", () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoList />);

    expect(screen.getByText("Admin Todo List")).toBeInTheDocument();
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);

    const quickInput = screen.getByPlaceholderText(
      "What needs to be done next? (Press Enter to add)",
    );
    fireEvent.change(quickInput, { target: { value: "Review vendor NDA agreements" } });

    const submitBtn = screen.getByRole("button", { name: "Add Task" });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Review vendor NDA agreements")).toBeInTheDocument();
  });

  it("opens create modal on clicking New Todo button", () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoList />);

    const newTodoBtn = screen.getByRole("button", { name: "New Todo" });
    fireEvent.click(newTodoBtn);

    expect(screen.getByText("Create Admin Task")).toBeInTheDocument();
  });

  it("filters tasks by status tabs", () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoList />);

    const completedTab = screen.getByRole("tab", { name: "Completed" });
    fireEvent.click(completedTab);

    expect(completedTab).toHaveAttribute("aria-selected", "true");
  });
});
