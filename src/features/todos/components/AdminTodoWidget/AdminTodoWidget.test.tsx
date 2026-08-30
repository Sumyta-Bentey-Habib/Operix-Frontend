import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminTodoWidget } from "./AdminTodoWidget";
import type { OperixViewer } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

describe("AdminTodoWidget", () => {
  const adminViewer: OperixViewer = {
    userId: "admin-widget-1",
    role: "ADMIN",
    status: "ACTIVE",
    scope: { type: "ADMIN", teamIds: ["team-1"] },
  };

  const memberViewer: OperixViewer = {
    userId: "member-widget-1",
    role: "MEMBER",
    status: "ACTIVE",
    scope: { type: "MEMBER", teamId: "team-1" },
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not render for non-admin users", () => {
    mocks.useAuth.mockReturnValue({
      viewer: memberViewer,
      isLoading: false,
    });

    const { container } = render(<AdminTodoWidget />);
    expect(container.firstChild).toBeNull();
  });

  it("renders widget and handles quick add and toggle for admin", () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<AdminTodoWidget />);

    expect(screen.getByText("Admin Checklist")).toBeInTheDocument();
    expect(screen.getByText("View All Todos")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("What needs to be done next? (Press Enter to add)");
    fireEvent.change(input, { target: { value: "Urgent Widget Task" } });

    const submitBtn = screen.getByRole("button", { name: "Add Task" });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Urgent Widget Task")).toBeInTheDocument();
  });
});
