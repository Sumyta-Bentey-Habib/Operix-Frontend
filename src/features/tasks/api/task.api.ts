import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  AssignTaskInput,
  CancelDistributionResponse,
  CompleteTaskInput,
  CreateTaskInput,
  RescheduleDistributionInput,
  Task,
  TaskListQuery,
  TaskRecurrenceSummary,
  TaskStatusHistoryEntry,
  UpdateTaskRecurrenceInput,
  UpdateTaskSelfClaimInput,
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
      json: {
        responsibleUserId: input.responsibleUserId ?? input.memberId,
        ...(input.note ? { note: input.note } : {}),
      },
    }),

  claim: (taskId: string): Promise<Task> =>
    apiRequest(`/tasks/${taskId}/claim`, {
      method: "POST",
    }),

  updateSelfClaim: (
    taskId: string,
    input: UpdateTaskSelfClaimInput,
  ): Promise<Task> =>
    apiRequest(`/tasks/${taskId}/self-claim`, {
      method: "PATCH",
      json: input,
    }),

  start: (taskId: string): Promise<Task> =>
    apiRequest(`/tasks/${taskId}/start`, {
      method: "POST",
    }),

  complete: (taskId: string, input?: CompleteTaskInput): Promise<Task> =>
    apiRequest(`/tasks/${taskId}/complete`, {
      method: "POST",
      ...(input ? { json: input } : {}),
    }),

  rescheduleDistribution: (
    taskId: string,
    input: RescheduleDistributionInput,
  ): Promise<Task> =>
    apiRequest(`/tasks/${taskId}/distribution`, {
      method: "PATCH",
      json: input,
    }),

  cancelDistribution: (taskId: string): Promise<CancelDistributionResponse> =>
    apiRequest(`/tasks/${taskId}/distribution/cancel`, {
      method: "POST",
    }),

  getRecurrence: (
    recurrenceId: string,
    options?: { signal?: AbortSignal },
  ): Promise<TaskRecurrenceSummary> =>
    apiRequest(`/task-recurrences/${recurrenceId}`, {
      signal: options?.signal,
    }),

  updateRecurrence: (
    recurrenceId: string,
    input: UpdateTaskRecurrenceInput,
  ): Promise<TaskRecurrenceSummary> =>
    apiRequest(`/task-recurrences/${recurrenceId}`, {
      method: "PATCH",
      json: input,
    }),
};

