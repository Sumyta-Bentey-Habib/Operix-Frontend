import { apiRequest, type QueryParams } from "@/lib/api";
import type {
  ClearCompletedResponse,
  CreateTodoInput,
  PaginatedTodoResponse,
  TodoItem,
  TodoListQuery,
  TodoStats,
  UpdateTodoInput,
} from "../types/todo.types";

export const todoApi = {
  list: (
    query?: TodoListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedTodoResponse> =>
    apiRequest<PaginatedTodoResponse>("/todos", {
      query: (query as unknown as QueryParams) ?? {},
      signal: options?.signal,
    }),

  summary: (options?: { signal?: AbortSignal }): Promise<TodoStats> =>
    apiRequest<TodoStats>("/todos/summary", {
      signal: options?.signal,
    }),

  getById: (id: string, options?: { signal?: AbortSignal }): Promise<TodoItem> =>
    apiRequest<TodoItem>(`/todos/${id}`, {
      signal: options?.signal,
    }),

  create: (input: CreateTodoInput): Promise<TodoItem> =>
    apiRequest<TodoItem>("/todos", {
      method: "POST",
      json: input,
    }),

  update: (id: string, input: UpdateTodoInput): Promise<TodoItem> =>
    apiRequest<TodoItem>(`/todos/${id}`, {
      method: "PATCH",
      json: input,
    }),

  complete: (id: string): Promise<TodoItem> =>
    apiRequest<TodoItem>(`/todos/${id}/complete`, {
      method: "POST",
    }),

  reopen: (id: string): Promise<TodoItem> =>
    apiRequest<TodoItem>(`/todos/${id}/reopen`, {
      method: "POST",
    }),

  delete: (id: string): Promise<TodoItem> =>
    apiRequest<TodoItem>(`/todos/${id}`, {
      method: "DELETE",
    }),

  clearCompleted: (): Promise<ClearCompletedResponse> =>
    apiRequest<ClearCompletedResponse>("/todos/completed", {
      method: "DELETE",
    }),
};
