import { describe, expect, it } from "vitest";
import type { TaskAiDraft } from "@/features/tasks/types/task.types";
import {
  AI_DRAFT_PROMPT_MAX_LENGTH,
  AI_DRAFT_PROMPT_MIN_LENGTH,
  isAiDraftPromptReady,
  toAiDraftFieldValues,
  toDueAtInputValue,
} from "@/features/tasks/utils/task-ai-draft";

const pad = (value: number) => String(value).padStart(2, "0");

const localInputFrom = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;

const draft: TaskAiDraft = {
  title: "Verify cold chain temperature logs",
  description: "Review last week's logs and flag every excursion above 8°C.",
  suggestedPriority: "HIGH",
  suggestedCompletionMode: "REVIEW_REQUIRED",
  suggestedDueAt: "2026-11-02T09:00:00.000Z",
  reasoning: "The prompt describes a recurring compliance check.",
  meta: { model: "gemini-3.1-flash-lite", attempts: 1, latencyMs: 900 },
};

describe("isAiDraftPromptReady", () => {
  it("requires at least the backend minimum length after trimming", () => {
    expect(isAiDraftPromptReady("")).toBe(false);
    expect(isAiDraftPromptReady("   short   ")).toBe(false);
    expect(isAiDraftPromptReady("a".repeat(AI_DRAFT_PROMPT_MIN_LENGTH - 1))).toBe(false);
    expect(isAiDraftPromptReady(`   ${"a".repeat(AI_DRAFT_PROMPT_MIN_LENGTH)}   `)).toBe(true);
  });

  it("accepts prompts up to the backend maximum length", () => {
    expect(isAiDraftPromptReady("a".repeat(AI_DRAFT_PROMPT_MAX_LENGTH))).toBe(true);
    expect(isAiDraftPromptReady("a".repeat(AI_DRAFT_PROMPT_MAX_LENGTH + 1))).toBe(false);
  });
});

describe("toDueAtInputValue", () => {
  it("returns an empty value when no deadline is suggested", () => {
    expect(toDueAtInputValue(null)).toBe("");
    expect(toDueAtInputValue("")).toBe("");
  });

  it("returns an empty value for an unparseable timestamp", () => {
    expect(toDueAtInputValue("not-a-date")).toBe("");
  });

  it("converts a UTC instant into the local wall-clock value the picker uses", () => {
    const instant = new Date(2026, 10, 2, 14, 30);

    expect(toDueAtInputValue(instant.toISOString())).toBe(localInputFrom(instant));
  });

  it("emits a YYYY-MM-DDTHH:mm value without seconds or timezone markers", () => {
    const value = toDueAtInputValue(draft.suggestedDueAt);

    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe("toAiDraftFieldValues", () => {
  it("maps only the human editable form fields", () => {
    const values = toAiDraftFieldValues(draft);

    expect(values).toEqual({
      title: draft.title,
      description: draft.description,
      priority: "HIGH",
      completionMode: "REVIEW_REQUIRED",
      dueAt: toDueAtInputValue(draft.suggestedDueAt),
    });
    expect(Object.keys(values).sort()).toEqual([
      "completionMode",
      "description",
      "dueAt",
      "priority",
      "title",
    ]);
  });

  it("leaves the deadline empty when the draft does not suggest one", () => {
    expect(toAiDraftFieldValues({ ...draft, suggestedDueAt: null }).dueAt).toBe("");
  });
});
