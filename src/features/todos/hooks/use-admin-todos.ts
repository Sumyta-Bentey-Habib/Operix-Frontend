"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isAbortError } from "@/lib/api";
import { canViewAdminTodos } from "@/lib/auth/permissions";
import { todoApi } from "../api/todo.api";
import { TODO_STRINGS } from "../constants/todo-strings";
import type {
  CreateTodoInput,
  TodoFilterState,
  TodoItem,
  TodoListQuery,
  TodoSort,
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

const DEFAULT_STATS: TodoStats = {
  total: 0,
  active: 0,
  completed: 0,
  urgent: 0,
  overdue: 0,
  completionRate: 0,
};

const mapFilterToSort = (
  sortBy: TodoFilterState["sortBy"],
  sortOrder: TodoFilterState["sortOrder"],
): TodoSort => {
  if (sortBy === "dueDate") {
    return sortOrder === "asc" ? "DUE_ON_ASC" : "DUE_ON_DESC";
  }
  if (sortBy === "priority") {
    return sortOrder === "asc" ? "PRIORITY_ASC" : "PRIORITY_DESC";
  }
  if (sortBy === "title") {
    return sortOrder === "asc" ? "TITLE_ASC" : "TITLE_DESC";
  }
  return sortOrder === "asc" ? "CREATED_AT_ASC" : "CREATED_AT_DESC";
};

export const useAdminTodos = () => {
  const { viewer, isLoading: isAuthLoading } = useAuth();
  const isAdmin = canViewAdminTodos(viewer);

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [stats, setStats] = useState<TodoStats>(DEFAULT_STATS);
  const [filterState, setFilterState] = useState<TodoFilterState>(DEFAULT_FILTER_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback((filters: TodoFilterState): TodoListQuery => {
    const query: TodoListQuery = {};

    if (filters.status !== "ALL") {
      query.status = filters.status;
    }
    if (filters.priority !== "ALL") {
      query.priority = filters.priority;
    }
    if (filters.category !== "ALL") {
      query.category = filters.category;
    }
    if (filters.search.trim()) {
      query.q = filters.search.trim();
    }
    query.sort = mapFilterToSort(filters.sortBy, filters.sortOrder);

    return query;
  }, []);

  const loadData = useCallback(
    async (filters: TodoFilterState, signal?: AbortSignal) => {
      if (!isAdmin) {
        setTodos([]);
        setStats(DEFAULT_STATS);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const query = buildQuery(filters);
        const [listResponse, summaryResponse] = await Promise.all([
          todoApi.list(query, { signal }),
          todoApi.summary({ signal }),
        ]);

        if (signal?.aborted) return;
        setTodos(listResponse.data);
        setStats(summaryResponse);
      } catch (err) {
        if (!isAbortError(err) && !signal?.aborted) {
          const message = err instanceof Error ? err.message : TODO_STRINGS.errors.genericFailed;
          setError(message);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [buildQuery, isAdmin],
  );

  useEffect(() => {
    if (isAuthLoading) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadData(filterState, controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filterState, isAuthLoading, loadData]);

  const reloadTodos = useCallback(async () => {
    await loadData(filterState);
  }, [filterState, loadData]);

  const handleAddTodo = useCallback(
    async (input: CreateTodoInput): Promise<TodoItem | null> => {
      if (!isAdmin) return null;
      setIsSubmitting(true);
      setError(null);
      try {
        const created = await todoApi.create(input);
        await reloadTodos();
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : TODO_STRINGS.errors.genericFailed;
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAdmin, reloadTodos],
  );

  const handleUpdateTodo = useCallback(
    async (id: string, updates: UpdateTodoInput): Promise<TodoItem | null> => {
      if (!isAdmin) return null;
      setIsSubmitting(true);
      setError(null);
      try {
        const updated = await todoApi.update(id, updates);
        await reloadTodos();
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : TODO_STRINGS.errors.genericFailed;
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAdmin, reloadTodos],
  );

  const handleToggleTodo = useCallback(
    async (id: string): Promise<TodoItem | null> => {
      if (!isAdmin) return null;
      const target = todos.find((t) => t.id === id);
      setIsSubmitting(true);
      setError(null);
      try {
        const updated = target?.completed ? await todoApi.reopen(id) : await todoApi.complete(id);
        await reloadTodos();
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : TODO_STRINGS.errors.genericFailed;
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAdmin, reloadTodos, todos],
  );

  const handleDeleteTodo = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAdmin) return false;
      setIsSubmitting(true);
      setError(null);
      try {
        await todoApi.delete(id);
        await reloadTodos();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : TODO_STRINGS.errors.genericFailed;
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAdmin, reloadTodos],
  );

  const handleClearCompleted = useCallback(async () => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await todoApi.clearCompleted();
      await reloadTodos();
    } catch (err) {
      const message = err instanceof Error ? err.message : TODO_STRINGS.errors.genericFailed;
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAdmin, reloadTodos]);

  const resetFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  return {
    todos,
    filteredTodos: todos,
    stats,
    filterState,
    setFilterState,
    resetFilters,
    reloadTodos,
    addTodo: handleAddTodo,
    updateTodo: handleUpdateTodo,
    toggleTodo: handleToggleTodo,
    deleteTodo: handleDeleteTodo,
    clearCompleted: handleClearCompleted,
    isAdmin,
    isLoading: isAuthLoading || isLoading,
    isSubmitting,
    error,
  };
};
