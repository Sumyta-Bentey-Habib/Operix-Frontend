import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";

export type AskOperixStatus = "ANSWERED" | "NEEDS_CLARIFICATION" | "UNSUPPORTED";
export type AskOperixConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface AskOperixTaskReference {
  id: string;
  referenceCode: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
}

export interface AskOperixResponse {
  status: AskOperixStatus;
  answer: string | null;
  clarification: string | null;
  highlights: string[];
  references: {
    tasks: AskOperixTaskReference[];
    operations: { days: 7 | 30 | 90; asOf: string } | null;
  };
  confidence: AskOperixConfidence | null;
  limitations: string[];
  meta: {
    provider: string;
    model: string;
    attempts: number;
    latencyMs: number;
    intent: "TASK_QUERY" | "OPERATIONS_SNAPSHOT" | null;
  };
}
