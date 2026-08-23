import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  AssignTaskInput,
  CreateTaskInput,
  Task,
  TaskListQuery,
  TaskStatusHistoryEntry,
} from "../types/task.types";

export const taskApi = {
  list: (
    query: TaskListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<Task>> =>
    apiRequest("/tasks", {
      query: { ...query },
      signal: options?.signal,
    }),

  getById: (taskId: string, options?: { signal?: AbortSignal }): Promise<Task> =>
    apiRequest(`/tasks/${taskId}`, {
      signal: options?.signal,
    }),

  getHistory: (
    taskId: string,
    params: { page: number; limit: number },
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<TaskStatusHistoryEntry>> =>
    apiRequest(`/tasks/${taskId}/history`, {
      query: {
        page: params.page,
        limit: params.limit,
      },
      signal: options?.signal,
    }),

  create: (input: CreateTaskInput): Promise<Task> =>
    apiRequest("/tasks", {
      method: "POST",
      json: input,
    }),

  assign: (taskId: string, input: AssignTaskInput): Promise<Task> =>
    apiRequest(`/tasks/${taskId}/assignments`, {
      method: "POST",
      json: input,
    }),

  start: (taskId: string): Promise<Task> =>
    apiRequest(`/tasks/${taskId}/start`, {
      method: "POST",
    }),
};
