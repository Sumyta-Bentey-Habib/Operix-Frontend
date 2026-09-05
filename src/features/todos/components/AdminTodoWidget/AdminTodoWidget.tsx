"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "@/components/icons";
import { PRIORITY_OPTIONS, TODO_STRINGS } from "../../constants/todo-strings";
import { useAdminTodos } from "../../hooks/use-admin-todos";
import type { TodoPriority } from "../../types/todo.types";
import styles from "./AdminTodoWidget.module.css";

export const AdminTodoWidget: React.FC = () => {
  const { todos, addTodo, toggleTodo, isAdmin, isLoading } = useAdminTodos();
  const [quickTitle, setQuickTitle] = useState("");

  if (!isAdmin || isLoading) return null;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTodo({
      title: quickTitle.trim(),
      priority: "MEDIUM",
      category: "OPERATIONS",
    });
    setQuickTitle("");
  };

  const activeTodos = todos.filter((t) => !t.completed).slice(0, 4);

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

  return (
    <div className={styles.widgetCard}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{TODO_STRINGS.widget.title}</h3>
          <span className={styles.subtitle}>{TODO_STRINGS.widget.subtitle}</span>
        </div>
        <Link href="/todos" className={styles.viewAllLink}>
          <span>{TODO_STRINGS.widget.viewAll}</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>

      <form onSubmit={handleQuickAdd} className={styles.quickAddForm}>
        <input
          type="text"
          className={styles.quickAddInput}
          placeholder={TODO_STRINGS.quickAddPlaceholder}
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button
          type="submit"
          className={styles.quickAddButton}
          disabled={!quickTitle.trim()}
          aria-label={TODO_STRINGS.quickAddButton}
        >
          <PlusIcon size={14} />
          <span>{TODO_STRINGS.quickAddButton}</span>
        </button>
      </form>

      <div className={styles.list}>
        {activeTodos.length === 0 ? (
          <div className={styles.emptyState}>{TODO_STRINGS.widget.empty}</div>
        ) : (
          activeTodos.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={item.completed}
                  onChange={() => toggleTodo(item.id)}
                  aria-label={`Toggle completion for ${item.title}`}
                />
                <span
                  className={`${styles.itemTitle} ${
                    item.completed ? styles.itemTitleCompleted : ""
                  }`}
                  title={item.title}
                >
                  {item.title}
                </span>
              </div>
              <div className={styles.itemRight}>
                <span className={`${styles.priorityBadge} ${getPriorityClass(item.priority)}`}>
                  {item.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
