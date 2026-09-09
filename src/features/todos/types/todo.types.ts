import type { PaginationMeta } from "@/types/pagination";

export type TodoPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TodoCategory =
  | "OPERATIONS"
  | "SECURITY"
  | "FINANCE"
  | "TEAM"
  | "COMPLIANCE"
  | "GENERAL";

export type TodoStatusFilter = "ALL" | "ACTIVE" | "COMPLETED";

export type TodoSortField = "createdAt" | "dueDate" | "priority" | "title";

export type SortOrder = "asc" | "desc";

export type TodoSort =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "DUE_ON_ASC"
  | "DUE_ON_DESC"
  | "PRIORITY_DESC"
  | "PRIORITY_ASC"
  | "TITLE_ASC"
  | "TITLE_DESC";

export interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  category: TodoCategory;
  dueDate: string | null;
  tags: string[];
  completed: boolean;
  completedAt: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: TodoPriority;
  category?: TodoCategory;
  dueDate?: string | null;
  tags?: string[];
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  priority?: TodoPriority;
  category?: TodoCategory;
  dueDate?: string | null;
  tags?: string[];
}

export interface TodoListQuery {
  page?: number;
  limit?: number;
  status?: TodoStatusFilter;
  priority?: TodoPriority;
  category?: TodoCategory;
  overdue?: boolean;
  q?: string;
  sort?: TodoSort;
}

export interface TodoFilterState {
  status: TodoStatusFilter;
  priority: "ALL" | TodoPriority;
  category: "ALL" | TodoCategory;
  search: string;
  sortBy: TodoSortField;
  sortOrder: SortOrder;
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  urgent: number;
  overdue: number;
  completionRate: number;
}

export interface PaginatedTodoResponse {
  data: TodoItem[];
  meta: PaginationMeta;
}

export interface ClearCompletedResponse {
  deleted: number;
}
