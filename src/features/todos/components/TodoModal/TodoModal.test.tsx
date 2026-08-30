import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TodoModal } from "./TodoModal";
import type { TodoItem } from "../../types/todo.types";

describe("TodoModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockTodo: TodoItem = {
    id: "todo-test-1",
    userId: "admin-1",
    title: "Test Existing Title",
    description: "Test Existing Description",
    completed: false,
    priority: "HIGH",
    category: "SECURITY",
    dueDate: "2026-09-15",
    tags: ["audit", "compliance"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  };

  it("renders create mode when no initialData is provided", () => {
    render(
      <TodoModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText("Create Admin Task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Task" })).toBeDisabled();

    // Type title and submit
    fireEvent.change(screen.getByPlaceholderText("e.g. Verify Q3 compliance reports"), {
      target: { value: "Brand New Audit Task" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Brand New Audit Task",
        priority: "MEDIUM",
        category: "GENERAL",
      }),
    );
  });

  it("renders edit mode with initial data pre-filled", () => {
    render(
      <TodoModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={mockTodo}
      />,
    );

    expect(screen.getByText("Edit Admin Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Existing Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Existing Description")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Test Existing Title"), {
      target: { value: "Updated Title Value" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated Title Value",
        priority: "HIGH",
        category: "SECURITY",
      }),
    );
  });
});
