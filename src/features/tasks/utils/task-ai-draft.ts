import { dateToYmd } from "@/utils/calendar";
import type {
  TaskAiDraft,
  TaskCompletionMode,
  TaskPriority,
} from "../types/task.types";

/** Mirrors the backend `GenerateTaskAiDraftDto` prompt bounds. */
export const AI_DRAFT_PROMPT_MIN_LENGTH = 10;
export const AI_DRAFT_PROMPT_MAX_LENGTH = 4000;

export interface AiDraftFieldValues {
  title: string;
  description: string;
  priority: TaskPriority;
  completionMode: TaskCompletionMode;
  dueAt: string;
}

export const isAiDraftPromptReady = (prompt: string): boolean => {
  const trimmed = prompt.trim();

  return (
    trimmed.length >= AI_DRAFT_PROMPT_MIN_LENGTH &&
    trimmed.length <= AI_DRAFT_PROMPT_MAX_LENGTH
  );
};

/**
 * The `DateTimePicker` and the form state use a local wall-clock value
 * (`YYYY-MM-DDTHH:mm`), while the API returns UTC ISO 8601. Convert so the
 * suggested deadline is displayed and resubmitted at the intended local time.
 */
export const toDueAtInputValue = (iso: string | null): string => {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${dateToYmd(date)}T${hours}:${minutes}`;
};

/**
 * Maps an advisory draft onto the exact form fields a human may apply. No id,
 * assignment, scope, or workflow value is carried over.
 */
export const toAiDraftFieldValues = (draft: TaskAiDraft): AiDraftFieldValues => ({
  title: draft.title,
  description: draft.description,
  priority: draft.suggestedPriority,
  completionMode: draft.suggestedCompletionMode,
  dueAt: toDueAtInputValue(draft.suggestedDueAt),
});
