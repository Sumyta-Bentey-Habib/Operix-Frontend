"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  TODO_STRINGS,
} from "../../constants/todo-strings";
import type {
  CreateTodoInput,
  TodoCategory,
  TodoItem,
  TodoPriority,
  UpdateTodoInput,
} from "../../types/todo.types";
import styles from "./TodoModal.module.css";

interface TodoFormProps {
  initialData?: TodoItem | null;
  onClose: () => void;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ initialData, onClose, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState<TodoPriority>(initialData?.priority || "MEDIUM");
  const [category, setCategory] = useState<TodoCategory>(initialData?.category || "GENERAL");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(TODO_STRINGS.errors.titleRequired);
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate || null,
      tags: parsedTags,
    });

    onClose();
  };

  const isEditing = Boolean(initialData);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label htmlFor="todo-title" className={styles.label}>
          {TODO_STRINGS.modal.titleLabel} *
        </label>
        <input
          id="todo-title"
          type="text"
          className={styles.input}
          placeholder={TODO_STRINGS.modal.titlePlaceholder}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="todo-desc" className={styles.label}>
          {TODO_STRINGS.modal.descriptionLabel}
        </label>
        <textarea
          id="todo-desc"
          className={styles.textarea}
          placeholder={TODO_STRINGS.modal.descriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="todo-priority" className={styles.label}>
            {TODO_STRINGS.modal.priorityLabel}
          </label>
          <select
            id="todo-priority"
            className={styles.select}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="todo-category" className={styles.label}>
            {TODO_STRINGS.modal.categoryLabel}
          </label>
          <select
            id="todo-category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as TodoCategory)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="todo-due-date" className={styles.label}>
            {TODO_STRINGS.modal.dueDateLabel}
          </label>
          <input
            id="todo-due-date"
            type="date"
            className={styles.input}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="todo-tags" className={styles.label}>
            {TODO_STRINGS.modal.tagsLabel}
          </label>
          <input
            id="todo-tags"
            type="text"
            className={styles.input}
            placeholder={TODO_STRINGS.modal.tagsPlaceholder}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
        >
          {TODO_STRINGS.actions.cancel}
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!title.trim()}
        >
          {isEditing ? TODO_STRINGS.actions.save : TODO_STRINGS.actions.create}
        </button>
      </div>
    </form>
  );
};

export interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => void;
  initialData?: TodoItem | null;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isEditing ? TODO_STRINGS.modal.editTitle : TODO_STRINGS.modal.createTitle}
    >
      <TodoForm
        key={initialData?.id ?? (isOpen ? "open-new" : "closed")}
        initialData={initialData}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};
