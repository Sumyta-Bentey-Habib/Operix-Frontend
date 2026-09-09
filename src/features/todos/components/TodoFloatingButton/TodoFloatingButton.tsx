"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  PlusIcon,
  TodoIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { PRIORITY_OPTIONS, TODO_STRINGS } from "../../constants/todo-strings";
import { useAdminTodos } from "../../hooks/use-admin-todos";
import type { TodoPriority } from "../../types/todo.types";
import styles from "./TodoFloatingButton.module.css";

export const TodoFloatingButton: React.FC = () => {
  const { todos, stats, toggleTodo, isAdmin, isSubmitting } = useAdminTodos();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Display top 5 active todos first
  const displayTodos = useMemo(() => {
    return [...todos]
      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
      .slice(0, 5);
  }, [todos]);

  if (!isAdmin) return null;

  const getPriorityClass = (priority: TodoPriority) => {
    const found = PRIORITY_OPTIONS.find((p) => p.value === priority);
    if (!found) return styles.priorityMedium;
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
    <div className={styles.floatingWrapper} ref={wrapperRef}>
      {/* Popover Panel */}
      {isOpen && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label={TODO_STRINGS.floatingButton.panelTitle}
        >
          <div className={styles.panelHeader}>
            <div className={styles.headerTitleGroup}>
              <h4 className={styles.headerTitle}>{TODO_STRINGS.floatingButton.panelTitle}</h4>
              <span className={styles.headerCountBadge}>
                {stats.active} {TODO_STRINGS.floatingButton.activeBadgeSuffix}
              </span>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label={TODO_STRINGS.floatingButton.close}
            >
              ✕
            </button>
          </div>

          <div className={styles.todoList}>
            {displayTodos.length === 0 ? (
              <div className={styles.emptyState}>
                <span>{TODO_STRINGS.floatingButton.empty}</span>
              </div>
            ) : (
              displayTodos.map((item) => {
                const overdue = isOverdue(item.dueDate, item.completed) || item.isOverdue;
                return (
                  <div key={item.id} className={styles.todoItem}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={item.completed}
                      onChange={() => toggleTodo(item.id)}
                      disabled={isSubmitting}
                      aria-label={`Toggle ${item.title}`}
                    />
                    <div className={styles.todoBody}>
                      <span
                        className={`${styles.todoTitle} ${
                          item.completed ? styles.todoTitleCompleted : ""
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </span>
                      <div className={styles.todoMeta}>
                        <span
                          className={`${styles.priorityBadge} ${getPriorityClass(item.priority)}`}
                        >
                          {item.priority}
                        </span>
                        {item.dueDate && (
                          <span
                            className={`${styles.dueDateBadge} ${
                              overdue ? styles.dueDateOverdue : ""
                            }`}
                          >
                            <CalendarIcon size={11} />
                            <span>{item.dueDate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.panelFooter}>
            <Link
              href="/todos"
              className={styles.viewMoreBtn}
              onClick={() => setIsOpen(false)}
            >
              <span>{TODO_STRINGS.floatingButton.viewMore}</span>
              <ArrowRightIcon size={14} />
            </Link>
            <Link
              href="/todos?action=create"
              className={styles.createBtn}
              onClick={() => setIsOpen(false)}
            >
              <PlusIcon size={14} />
              <span>{TODO_STRINGS.floatingButton.createTodo}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        className={`${styles.fabButton} ${isOpen ? styles.fabButtonOpen : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={TODO_STRINGS.floatingButton.fabLabel}
        title={TODO_STRINGS.floatingButton.fabLabel}
      >
        <TodoIcon size={24} />
        {stats.active > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {stats.active > 99 ? "99+" : stats.active}
          </span>
        )}
      </button>
    </div>
  );
};
