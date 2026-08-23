"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { taskApi } from "../../api/task.api";
import type { CreateTaskInput } from "../../types/task.types";
import { getTaskErrorView } from "../task-errors";
import { TaskForm } from "../TaskForm";
import styles from "./TaskCreatePage.module.css";

export const TaskCreatePage = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: CreateTaskInput) => {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const task = await taskApi.create(input);
      router.replace(`/tasks/${task.id}`);
    } catch (createError) {
      setError(getTaskErrorView(createError).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <div>
        <p className={styles.eyebrow}>Operations</p>
        <h1 className={styles.title}>Create Task</h1>
        <p className={styles.description}>
          Create a pending Task for one of your backend-scoped Teams. Assignment is a separate
          workflow action after creation.
        </p>
      </div>
      <TaskForm pending={pending} error={error} onSubmit={handleSubmit} />
    </section>
  );
};
