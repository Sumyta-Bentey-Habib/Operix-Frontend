import type {
  TodoCategory,
  TodoPriority,
  TodoSortField,
  TodoStatusFilter
} from "../types/todo.types";

export const TODO_STRINGS = {
  pageTitle: "Admin Todo List",
  pageSubtitle: "Session-scoped tasks and operational checklist for administrators.",
  quickAddPlaceholder: "What needs to be done next? (Press Enter to add)",
  quickAddButton: "Add Task",
  openNewTaskModal: "New Todo",
  searchPlaceholder: "Search todos by title, note, or tag...",
  filters: {
    all: "All Tasks",
    active: "In Progress",
    completed: "Completed",
    allPriorities: "All Priorities",
    allCategories: "All Categories",
    sortBy: "Sort By",
  },
  stats: {
    total: "Total Tasks",
    active: "In Progress",
    completed: "Completed",
    urgent: "Urgent & High",
    overdue: "Overdue",
    completionRate: "Completion Rate",
  },
  actions: {
    create: "Create Task",
    edit: "Edit Task",
    delete: "Delete Task",
    save: "Save Changes",
    cancel: "Cancel",
    clearCompleted: "Clear Completed",
    markCompleted: "Mark as completed",
    markIncomplete: "Mark as incomplete",
  },
  empty: {
    noTasksTitle: "No tasks found",
    noTasksSubtitle: "You have no active todos in this view. Add one above to get started!",
    noSearchResultsTitle: "No matching todos",
    noSearchResultsSubtitle: "Try changing your search keywords or clearing your filters.",
  },
  modal: {
    createTitle: "Create Admin Task",
    editTitle: "Edit Admin Task",
    titleLabel: "Task Title",
    titlePlaceholder: "e.g. Verify Q3 compliance reports",
    descriptionLabel: "Description / Notes (Optional)",
    descriptionPlaceholder: "Add specific operational notes or sub-tasks...",
    priorityLabel: "Priority",
    categoryLabel: "Category",
    dueDateLabel: "Due Date",
    tagsLabel: "Tags (comma separated)",
    tagsPlaceholder: "e.g. audit, security, q3",
  },
  widget: {
    title: "Admin Checklist",
    subtitle: "Your local operational queue",
    viewAll: "View All Todos",
    empty: "All admin todos completed! 🎉",
  },
  errors: {
    titleRequired: "Task title is required.",
    unauthorized: "Only administrators can access the admin todo list.",
  },
} as const;

export const PRIORITY_OPTIONS: Array<{
  value: TodoPriority;
  label: string;
  badgeClass: string;
  accentClass: string;
}> = [
  { value: "LOW", label: "Low", badgeClass: "priorityLow", accentClass: "accentLow" },
  { value: "MEDIUM", label: "Medium", badgeClass: "priorityMedium", accentClass: "accentMedium" },
  { value: "HIGH", label: "High", badgeClass: "priorityHigh", accentClass: "accentHigh" },
  { value: "URGENT", label: "Urgent", badgeClass: "priorityUrgent", accentClass: "accentUrgent" },
];

export const CATEGORY_OPTIONS: Array<{
  value: TodoCategory;
  label: string;
  tagClass: string;
}> = [
  { value: "OPERATIONS", label: "Operations", tagClass: "categoryOperations" },
  { value: "SECURITY", label: "Security", tagClass: "categorySecurity" },
  { value: "FINANCE", label: "Finance", tagClass: "categoryFinance" },
  { value: "TEAM", label: "Team", tagClass: "categoryTeam" },
  { value: "COMPLIANCE", label: "Compliance", tagClass: "categoryCompliance" },
  { value: "GENERAL", label: "General", tagClass: "categoryGeneral" },
];

export const SORT_OPTIONS: Array<{
  value: TodoSortField;
  label: string;
}> = [
  { value: "createdAt", label: "Date Created" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
];

export const STATUS_FILTER_TABS: Array<{
  value: TodoStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export const DEFAULT_ADMIN_TODO_TEMPLATES = [
  {
    idSuffix: "1",
    title: "Review and approve pending team expense reports",
    description: "Check Q3 regional travel vouchers and equipment requisitions before cutoff.",
    completed: false,
    priority: "URGENT" as TodoPriority,
    category: "FINANCE" as TodoCategory,
    offsetDays: 1,
    tags: ["finance", "approval", "q3"],
  },
  {
    idSuffix: "2",
    title: "Audit member role permissions and 2FA compliance",
    description: "Ensure all newly joined team leads have completed security onboarding.",
    completed: false,
    priority: "HIGH" as TodoPriority,
    category: "SECURITY" as TodoCategory,
    offsetDays: 3,
    tags: ["security", "audit", "compliance"],
  },
  {
    idSuffix: "3",
    title: "Assign sprint milestones for operations redesign",
    description: "Coordinate with engineering and product leads on phase 2 delivery.",
    completed: false,
    priority: "MEDIUM" as TodoPriority,
    category: "OPERATIONS" as TodoCategory,
    offsetDays: 5,
    tags: ["operations", "milestones"],
  },
  {
    idSuffix: "4",
    title: "Schedule bi-weekly regional team sync",
    description: "Send calendar invites and prepare presentation deck on performance KPIs.",
    completed: true,
    priority: "LOW" as TodoPriority,
    category: "TEAM" as TodoCategory,
    offsetDays: -1,
    tags: ["team", "meeting"],
  },
];
