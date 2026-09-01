export type TodoPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TodoCategory =
  "OPERATIONS" | "SECURITY" | "FINANCE" | "TEAM" | "COMPLIANCE" | "GENERAL";

export type TodoStatusFilter = "ALL" | "ACTIVE" | "COMPLETED";

export type TodoSortField = "dueDate" | "createdAt" | "priority" | "title";

export type SortOrder = "asc" | "desc";

export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  category: TodoCategory;
  dueDate?: string | null; // ISO string YYYY-MM-DD
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  category?: TodoCategory;
  dueDate?: string | null;
  tags?: string[];
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TodoPriority;
  category?: TodoCategory;
  dueDate?: string | null;
  tags?: string[];
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
