export type DocumentAiConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface DocumentAiActionItem {
  action: string;
  ownerMentioned: string | null;
  dueDateMentioned: string | null;
}

export interface DocumentAiImportantDate {
  dateText: string;
  context: string;
}

export interface DocumentAiMeta {
  provider: string;
  model: string;
  latencyMs: number;
  attempts: number;
}

/** Advisory response from POST /documents/:documentId/ai-analysis. */
export interface DocumentAiAnalysis {
  documentId: string;
  summary: string;
  keyPoints: string[];
  actionItems: DocumentAiActionItem[];
  importantDates: DocumentAiImportantDate[];
  risksOrWarnings: string[];
  confidence: DocumentAiConfidence;
  /** Server-owned extraction and advisory caveats. */
  limitations: string[];
  meta: DocumentAiMeta;
}

const DOCUMENT_AI_SUPPORTED_MIME_TYPES: ReadonlySet<string> = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const isDocumentAiSupportedMimeType = (mimeType: string): boolean =>
  DOCUMENT_AI_SUPPORTED_MIME_TYPES.has(mimeType);
