"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { SendIcon, SparklesIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { ASSISTANT_STRINGS } from "../../constants/assistant-strings";
import { useAskOperix } from "../../hooks/use-ask-operix";
import styles from "./AskOperixPanel.module.css";

export interface AskOperixPanelProps {
  open: boolean;
  onClose: () => void;
}

export const AskOperixPanel = ({ open, onClose }: AskOperixPanelProps) => {
  const { viewer } = useAuth();
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { response, pending, error, ask, cancel } = useAskOperix();
  const examples =
    viewer?.role === "MEMBER" ? ASSISTANT_STRINGS.memberExamples : ASSISTANT_STRINGS.adminExamples;

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else cancel();
  }, [open, cancel]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = question.trim();
    if (normalized.length < 3) return;
    void ask(normalized);
  };

  return (
    <Modal
      open={open}
      title={ASSISTANT_STRINGS.title}
      description={ASSISTANT_STRINGS.description}
      onClose={onClose}
    >
      <div className={styles.panel}>
        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label} htmlFor="ask-operix-question">
            {ASSISTANT_STRINGS.label}
          </label>
          <textarea
            ref={inputRef}
            id="ask-operix-question"
            className={styles.input}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={ASSISTANT_STRINGS.placeholder}
            minLength={3}
            maxLength={1000}
            rows={3}
          />
          <div className={styles.formFooter}>
            <span className={styles.count}>{question.length}/1000</span>
            <button
              className={styles.askButton}
              type="submit"
              disabled={question.trim().length < 3}
            >
              {pending ? <SparklesIcon size={16} /> : <SendIcon size={16} />}
              {pending ? ASSISTANT_STRINGS.asking : ASSISTANT_STRINGS.ask}
            </button>
          </div>
        </form>

        {!response && !error && !pending && (
          <section className={styles.welcome} aria-label={ASSISTANT_STRINGS.examples}>
            <p>{ASSISTANT_STRINGS.empty}</p>
            <strong>{ASSISTANT_STRINGS.examples}</strong>
            <div className={styles.examples}>
              {examples.map((example) => (
                <button type="button" key={example} onClick={() => setQuestion(example)}>
                  {example}
                </button>
              ))}
            </div>
          </section>
        )}

        {pending && (
          <div className={styles.loading} role="status">
            {ASSISTANT_STRINGS.asking}…
          </div>
        )}
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {response && (
          <article className={styles.result} aria-live="polite">
            <section>
              <h3>
                {response.status === "NEEDS_CLARIFICATION"
                  ? "Clarification needed"
                  : ASSISTANT_STRINGS.answer}
              </h3>
              <p>{response.clarification ?? response.answer}</p>
            </section>
            {response.highlights.length > 0 && (
              <section>
                <h3>{ASSISTANT_STRINGS.highlights}</h3>
                <ul>
                  {response.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {response.references.tasks.length > 0 && (
              <section>
                <h3>{ASSISTANT_STRINGS.matchingTasks}</h3>
                <ul className={styles.taskList}>
                  {response.references.tasks.map((task) => (
                    <li key={task.id} className={styles.taskCard}>
                      <div>
                        <span>{task.referenceCode}</span>
                        <strong>{task.title}</strong>
                      </div>
                      <p>
                        {task.priority} · {task.status}
                        {task.dueAt ? ` · Due ${formatDate(task.dueAt)}` : ""}
                      </p>
                      <Link href={`/tasks/${task.id}`} onClick={onClose}>
                        {ASSISTANT_STRINGS.viewTask}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {response.references.operations && (
              <section className={styles.snapshot}>
                <h3>{ASSISTANT_STRINGS.snapshot}</h3>
                <p>
                  {response.references.operations.days} day view · As of{" "}
                  {formatDateTime(response.references.operations.asOf)}
                </p>
              </section>
            )}
            {response.limitations.length > 0 && (
              <section className={styles.limitations}>
                <h3>{ASSISTANT_STRINGS.limitations}</h3>
                <ul>
                  {response.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {response.confidence && (
              <p className={styles.meta}>
                {ASSISTANT_STRINGS.confidence}: {response.confidence}
              </p>
            )}
          </article>
        )}
      </div>
    </Modal>
  );
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
