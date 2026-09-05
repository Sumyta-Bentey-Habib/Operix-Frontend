"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { canViewAdminTodos } from "@/lib/auth/permissions";
import {
  clearCompletedTodos,
  createTodo,
  deleteTodo,
  getStoredTodos,
  TODOS_SYNC_EVENT,
  toggleTodo,
  updateTodo,
} from "../utils/todo-storage";
import type {
  CreateTodoInput,
  TodoFilterState,
  TodoItem,
  TodoPriority,
  TodoStats,
  UpdateTodoInput,
} from "../types/todo.types";

const DEFAULT_FILTER_STATE: TodoFilterState = {
  status: "ALL",
  priority: "ALL",
  category: "ALL",
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const PRIORITY_WEIGHT: Record<TodoPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export const useAdminTodos = () => {
  const { viewer, isLoading: isAuthLoading } = useAuth();
  const isAdmin = canViewAdminTodos(viewer);
  const userId = viewer?.userId || "admin-default";

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (!isAdmin) return [];
    return getStoredTodos(userId);
  });
  const [filterState, setFilterState] = useState<TodoFilterState>(DEFAULT_FILTER_STATE);

  const reloadTodos = useCallback(() => {
    if (!isAdmin) {
      setTodos([]);
      return;
    }
    const stored = getStoredTodos(userId);
    setTodos(stored);
  }, [isAdmin, userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId?: string }>;
      if (!customEvent.detail?.userId || customEvent.detail.userId === userId) {
        reloadTodos();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes(userId)) {
        reloadTodos();
      }
    };

    window.addEventListener(TODOS_SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(TODOS_SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [reloadTodos, userId]);

  const handleAddTodo = useCallback(
    (input: CreateTodoInput): TodoItem | null => {
      if (!isAdmin) return null;
      const created = createTodo(userId, input);
      reloadTodos();
      return created;
    },
    [isAdmin, reloadTodos, userId],
  );

  const handleUpdateTodo = useCallback(
    (id: string, updates: Partial<UpdateTodoInput>): TodoItem | null => {
      if (!isAdmin) return null;
      const updated = updateTodo(userId, id, updates);
      reloadTodos();
      return updated;
    },
    [isAdmin, reloadTodos, userId],
  );

  const handleToggleTodo = useCallback(
    (id: string): TodoItem | null => {
      if (!isAdmin) return null;
      const updated = toggleTodo(userId, id);
      reloadTodos();
      return updated;
    },
    [isAdmin, reloadTodos, userId],
  );

  const handleDeleteTodo = useCallback(
    (id: string): boolean => {
      if (!isAdmin) return false;
      const success = deleteTodo(userId, id);
      reloadTodos();
      return success;
    },
    [isAdmin, reloadTodos, userId],
  );

  const handleClearCompleted = useCallback(() => {
    if (!isAdmin) return;
    clearCompletedTodos(userId);
    reloadTodos();
  }, [isAdmin, reloadTodos, userId]);

  const resetFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  const stats: TodoStats = useMemo(() => {
    const total = todos.length;
    const active = todos.filter((t) => !t.completed).length;
    const completed = todos.filter((t) => t.completed).length;
    const urgent = todos.filter(
      (t) => !t.completed && (t.priority === "URGENT" || t.priority === "HIGH"),
    ).length;

    const todayStr = new Date().toISOString().split("T")[0];
    const overdue = todos.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;

    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      active,
      completed,
      urgent,
      overdue,
      completionRate,
    };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos
      .filter((item) => {
        // Status filter
        if (filterState.status === "ACTIVE" && item.completed) return false;
        if (filterState.status === "COMPLETED" && !item.completed) return false;

        // Priority filter
        if (filterState.priority !== "ALL" && item.priority !== filterState.priority) return false;

        // Category filter
        if (filterState.category !== "ALL" && item.category !== filterState.category) return false;

        // Search query
        if (filterState.search.trim()) {
          const query = filterState.search.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchDesc = (item.description || "").toLowerCase().includes(query);
          const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
          const matchCategory = item.category.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchTags && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const orderFactor = filterState.sortOrder === "asc" ? 1 : -1;

        if (filterState.sortBy === "priority") {
          const pA = PRIORITY_WEIGHT[a.priority] || 0;
          const pB = PRIORITY_WEIGHT[b.priority] || 0;
          if (pA !== pB) return (pA - pB) * orderFactor;
        }

        if (filterState.sortBy === "dueDate") {
          const dateA = a.dueDate || "9999-99-99";
          const dateB = b.dueDate || "9999-99-99";
          if (dateA !== dateB) return dateA.localeCompare(dateB) * orderFactor;
        }

        if (filterState.sortBy === "title") {
          return a.title.localeCompare(b.title) * orderFactor;
        }

        // Default: createdAt
        return a.createdAt.localeCompare(b.createdAt) * orderFactor;
      });
  }, [filterState, todos]);

  return {
    todos,
    filteredTodos,
    stats,
    filterState,
    setFilterState,
    resetFilters,
    addTodo: handleAddTodo,
    updateTodo: handleUpdateTodo,
    toggleTodo: handleToggleTodo,
    deleteTodo: handleDeleteTodo,
    clearCompleted: handleClearCompleted,
    isAdmin,
    isLoading: isAuthLoading,
  };
};
