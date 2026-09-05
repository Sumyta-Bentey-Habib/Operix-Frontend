"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";
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

  const handleCancel = () => {
    router.push("/tasks");
  };

  return (
    <section className={styles.container}>
      {/* Top Breadcrumb & Navigation Bar */}
      <div className={styles.topBar}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/dashboard" className={styles.breadcrumbLink}>
            {TASK_CREATE_STRINGS.breadcrumbs.dashboard}
          </Link>
          <ChevronRightIcon size={12} className={styles.breadcrumbSeparator} />
          <Link href="/tasks" className={styles.breadcrumbLink}>
            {TASK_CREATE_STRINGS.breadcrumbs.tasks}
          </Link>
          <ChevronRightIcon size={12} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>
            {TASK_CREATE_STRINGS.breadcrumbs.current}
          </span>
        </nav>
        <Link href="/tasks" className={styles.backButton}>
          <ChevronLeftIcon size={14} />
          <span>{TASK_CREATE_STRINGS.navigation.backToTasks}</span>
        </Link>
      </div>

      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <span className={styles.eyebrow}>{TASK_CREATE_STRINGS.eyebrow}</span>
          <h1 className={styles.title}>{TASK_CREATE_STRINGS.title}</h1>
          <p className={styles.description}>{TASK_CREATE_STRINGS.description}</p>
        </div>
      </header>

      {/* Main Form */}
      <TaskForm pending={pending} error={error} onSubmit={handleSubmit} onCancel={handleCancel} />
    </section>
  );
};
