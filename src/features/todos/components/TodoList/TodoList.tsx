"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarIcon,
  FilterEditIcon,
  PlusIcon,
  SearchIcon,
  CheckCircleIcon,
} from "@/components/icons";
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  SORT_OPTIONS,
  STATUS_FILTER_TABS,
  TODO_STRINGS,
} from "../../constants/todo-strings";
import { useAdminTodos } from "../../hooks/use-admin-todos";
import type {
  CreateTodoInput,
  TodoCategory,
  TodoItem,
  TodoPriority,
  TodoSortField,
  TodoStatusFilter,
  UpdateTodoInput,
} from "../../types/todo.types";
import { TodoModal } from "../TodoModal/TodoModal";
import styles from "./TodoList.module.css";

export const TodoList: React.FC = () => {
  const {
    filteredTodos,
    stats,
    filterState,
    setFilterState,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    isAdmin,
    isLoading,
    isSubmitting,
    error,
    reloadTodos,
  } = useAdminTodos();

  const searchParams = useSearchParams();
  const [quickTitle, setQuickTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    if (searchParams?.get("action") === "create") {
      const timer = window.setTimeout(() => {
        setEditingTodo(null);
        setIsModalOpen(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  if (!isAdmin) {
    return (
      <div className={styles.emptyCard} role="alert">
        <h2 className={styles.emptyTitle}>{TODO_STRINGS.errors.unauthorized}</h2>
      </div>
    );
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    try {
      await addTodo({
        title: quickTitle.trim(),
        priority: "MEDIUM",
        category: "OPERATIONS",
      });
      setQuickTitle("");
    } catch {
      // Error is set and handled in useAdminTodos
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateTodoInput | UpdateTodoInput) => {
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, data as UpdateTodoInput);
      } else {
        await addTodo(data as CreateTodoInput);
      }
    } catch {
      // Handled in hook
    }
  };

  const getPriorityBadgeClass = (priority: TodoPriority) => {
    switch (priority) {
      case "URGENT":
        return styles.priorityUrgent;
      case "HIGH":
        return styles.priorityHigh;
      case "LOW":
        return styles.priorityLow;
      default:
        return styles.priorityMedium;
    }
  };

  const isOverdue = (dueDate?: string | null, completed?: boolean) => {
    if (!dueDate || completed) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    return dueDate < todayStr;
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.heading}>{TODO_STRINGS.pageTitle}</h1>
            <p className={styles.subheading}>{TODO_STRINGS.pageSubtitle}</p>
          </div>
          <button
            type="button"
            className={styles.newTodoButton}
            onClick={handleOpenCreateModal}
            disabled={isSubmitting}
          >
            <PlusIcon size={16} />
            <span>{TODO_STRINGS.openNewTaskModal}</span>
          </button>
        </div>

        {/* Quick Add Bar */}
        <form onSubmit={handleQuickAdd} className={styles.quickAddCard}>
          <input
            type="text"
            className={styles.quickAddInput}
            placeholder={TODO_STRINGS.quickAddPlaceholder}
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={styles.quickAddSubmit}
            disabled={!quickTitle.trim() || isSubmitting}
          >
            <PlusIcon size={16} />
            <span>{isSubmitting ? TODO_STRINGS.saving : TODO_STRINGS.quickAddButton}</span>
          </button>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button type="button" className={styles.retryButton} onClick={reloadTodos}>
            {TODO_STRINGS.retry}
          </button>
        </div>
      )}

      {/* KPI Stats Summary Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{TODO_STRINGS.stats.total}</span>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statSubtext}>
            {stats.completionRate}% {TODO_STRINGS.stats.completionRate.toLowerCase()}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>{TODO_STRINGS.stats.active}</span>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statSubtext}>{TODO_STRINGS.stats.activeSubtext}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>{TODO_STRINGS.stats.completed}</span>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statSubtext}>{TODO_STRINGS.stats.completedSubtext}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>{TODO_STRINGS.stats.urgent}</span>
          <span className={styles.statValue}>{stats.urgent}</span>
          <span className={styles.statSubtext}>
            {stats.overdue > 0
              ? `${stats.overdue} ${TODO_STRINGS.stats.overdueItemsSuffix}`
              : TODO_STRINGS.stats.urgentSubtextDefault}
          </span>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarRow}>
          {/* Status Tabs */}
          <div className={styles.statusTabs} role="tablist">
            {STATUS_FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={filterState.status === tab.value}
                className={`${styles.statusTab} ${
                  filterState.status === tab.value ? styles.statusTabActive : ""
                }`}
                onClick={() =>
                  setFilterState((prev) => ({ ...prev, status: tab.value as TodoStatusFilter }))
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Controls */}
          <div className={styles.filterControls}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>
                <SearchIcon size={14} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={TODO_STRINGS.searchPlaceholder}
                value={filterState.search}
                onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <select
              className={styles.selectInput}
              value={filterState.priority}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  priority: e.target.value as "ALL" | TodoPriority,
                }))
              }
              aria-label={TODO_STRINGS.filters.allPriorities}
            >
              <option value="ALL">{TODO_STRINGS.filters.allPriorities}</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <select
              className={styles.selectInput}
              value={filterState.category}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  category: e.target.value as "ALL" | TodoCategory,
                }))
              }
              aria-label={TODO_STRINGS.filters.allCategories}
            >
              <option value="ALL">{TODO_STRINGS.filters.allCategories}</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              className={styles.selectInput}
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  sortBy: e.target.value as TodoSortField,
                }))
              }
              aria-label={TODO_STRINGS.filters.sortBy}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {stats.completed > 0 && (
              <button
                type="button"
                className={styles.clearCompletedButton}
                onClick={clearCompleted}
                disabled={isSubmitting}
              >
                {isSubmitting ? TODO_STRINGS.clearing : TODO_STRINGS.actions.clearCompleted}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Todo List Items */}
      {isLoading && filteredTodos.length === 0 ? (
        <div className={styles.loadingContainer}>
          <span>{TODO_STRINGS.loading}</span>
        </div>
      ) : (
        <div className={styles.todoList}>
          {filteredTodos.length === 0 ? (
            <div className={styles.emptyCard}>
              <div style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                <CheckCircleIcon size={40} />
              </div>
              <h3 className={styles.emptyTitle}>
                {filterState.search ||
                filterState.priority !== "ALL" ||
                filterState.category !== "ALL"
                  ? TODO_STRINGS.empty.noSearchResultsTitle
                  : TODO_STRINGS.empty.noTasksTitle}
              </h3>
              <p className={styles.emptySubtitle}>
                {filterState.search ||
                filterState.priority !== "ALL" ||
                filterState.category !== "ALL"
                  ? TODO_STRINGS.empty.noSearchResultsSubtitle
                  : TODO_STRINGS.empty.noTasksSubtitle}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => {
              const overdue = isOverdue(todo.dueDate, todo.completed) || todo.isOverdue;
              return (
                <div
                  key={todo.id}
                  className={`${styles.todoItem} ${todo.completed ? styles.todoItemCompleted : ""}`}
                >
                  <div className={styles.itemMain}>
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        disabled={isSubmitting}
                        aria-label={`Toggle ${todo.title}`}
                      />
                    </div>

                    <div className={styles.itemContent}>
                      <span
                        className={`${styles.itemTitle} ${
                          todo.completed ? styles.itemTitleStrikethrough : ""
                        }`}
                      >
                        {todo.title}
                      </span>

                      {todo.description && (
                        <p className={styles.itemDescription}>{todo.description}</p>
                      )}

                      <div className={styles.itemMeta}>
                        <span
                          className={`${styles.priorityBadge} ${getPriorityBadgeClass(
                            todo.priority,
                          )}`}
                        >
                          {todo.priority}
                        </span>

                        <span className={`${styles.metaBadge} ${styles.categoryBadge}`}>
                          {todo.category}
                        </span>

                        {todo.dueDate && (
                          <span
                            className={`${styles.metaBadge} ${styles.dueDateBadge} ${
                              overdue ? styles.dueDateOverdue : ""
                            }`}
                          >
                            <CalendarIcon size={12} />
                            <span>
                              {overdue
                                ? `${TODO_STRINGS.labels.overdue} (${todo.dueDate})`
                                : `${TODO_STRINGS.labels.duePrefix} ${todo.dueDate}`}
                            </span>
                          </span>
                        )}

                        {todo.tags.map((tag) => (
                          <span key={tag} className={styles.tagBadge}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.actionIconBtn}
                      onClick={() => handleOpenEditModal(todo)}
                      aria-label={`${TODO_STRINGS.actions.edit}: ${todo.title}`}
                      title={TODO_STRINGS.actions.edit}
                      disabled={isSubmitting}
                    >
                      <FilterEditIcon size={14} />
                    </button>

                    <button
                      type="button"
                      className={`${styles.actionIconBtn} ${styles.deleteIconBtn}`}
                      onClick={() => deleteTodo(todo.id)}
                      aria-label={`${TODO_STRINGS.actions.delete}: ${todo.title}`}
                      title={TODO_STRINGS.actions.delete}
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTodo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
