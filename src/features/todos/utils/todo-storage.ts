import { DEFAULT_ADMIN_TODO_TEMPLATES } from "../constants/todo-strings";
import type {
  CreateTodoInput,
  TodoCategory,
  TodoItem,
  TodoPriority,
  UpdateTodoInput,
} from "../types/todo.types";

const STORAGE_PREFIX = "operix_admin_todos_";
export const TODOS_SYNC_EVENT = "operix_todos_updated";

export const getStorageKey = (userId: string): string => {
  const safeId = userId.trim() || "default_admin";
  return `${STORAGE_PREFIX}${safeId}`;
};

export const getDefaultAdminTodos = (userId: string): TodoItem[] => {
  const now = new Date();
  const createIso = (offsetDays: number) => {
    const d = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  };

  return DEFAULT_ADMIN_TODO_TEMPLATES.map((template) => ({
    id: `admin-todo-${template.idSuffix}`,
    userId,
    title: template.title,
    description: template.description,
    completed: template.completed,
    priority: template.priority,
    category: template.category,
    dueDate: createIso(template.offsetDays),
    tags: [...template.tags],
    createdAt: new Date(now.getTime() - Math.abs(template.offsetDays) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    completedAt: template.completed ? new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString() : null,
  }));
};

export const getStoredTodos = (userId: string): TodoItem[] => {
  if (typeof window === "undefined") {
    return getDefaultAdminTodos(userId);
  }

  try {
    const key = getStorageKey(userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      const defaults = getDefaultAdminTodos(userId);
      window.localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as TodoItem[];
    }
    return getDefaultAdminTodos(userId);
  } catch {
    return getDefaultAdminTodos(userId);
  }
};

export const setStoredTodos = (userId: string, todos: TodoItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    const key = getStorageKey(userId);
    window.localStorage.setItem(key, JSON.stringify(todos));
    window.dispatchEvent(
      new CustomEvent(TODOS_SYNC_EVENT, {
        detail: { userId, count: todos.length },
      }),
    );
  } catch (error) {
    console.error("Failed to save todos to localStorage:", error);
  }
};

export const createTodo = (userId: string, input: CreateTodoInput): TodoItem => {
  const current = getStoredTodos(userId);
  const now = new Date().toISOString();

  const newTodo: TodoItem = {
    id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    completed: false,
    priority: input.priority || "MEDIUM",
    category: input.category || "GENERAL",
    dueDate: input.dueDate || null,
    tags: input.tags?.map((t) => t.trim()).filter(Boolean) || [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  const updated = [newTodo, ...current];
  setStoredTodos(userId, updated);
  return newTodo;
};

export const updateTodo = (
  userId: string,
  id: string,
  updates: Partial<UpdateTodoInput>,
): TodoItem | null => {
  const current = getStoredTodos(userId);
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const existing = current[index];
  const isCompletedChange =
    updates.completed !== undefined && updates.completed !== existing.completed;

  const updatedItem: TodoItem = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    description:
      updates.description !== undefined ? updates.description.trim() : existing.description,
    priority: (updates.priority as TodoPriority) || existing.priority,
    category: (updates.category as TodoCategory) || existing.category,
    dueDate: updates.dueDate !== undefined ? updates.dueDate : existing.dueDate,
    tags:
      updates.tags !== undefined
        ? updates.tags.map((t) => t.trim()).filter(Boolean)
        : existing.tags,
    completed: updates.completed !== undefined ? updates.completed : existing.completed,
    completedAt: isCompletedChange
      ? updates.completed
        ? now
        : null
      : existing.completedAt,
    updatedAt: now,
  };

  const updatedList = [...current];
  updatedList[index] = updatedItem;
  setStoredTodos(userId, updatedList);
  return updatedItem;
};

export const toggleTodo = (userId: string, id: string): TodoItem | null => {
  const current = getStoredTodos(userId);
  const target = current.find((item) => item.id === id);
  if (!target) return null;

  return updateTodo(userId, id, { completed: !target.completed });
};

export const deleteTodo = (userId: string, id: string): boolean => {
  const current = getStoredTodos(userId);
  const filtered = current.filter((item) => item.id !== id);
  if (filtered.length === current.length) return false;

  setStoredTodos(userId, filtered);
  return true;
};

export const clearCompletedTodos = (userId: string): void => {
  const current = getStoredTodos(userId);
  const activeOnly = current.filter((item) => !item.completed);
  setStoredTodos(userId, activeOnly);
};
