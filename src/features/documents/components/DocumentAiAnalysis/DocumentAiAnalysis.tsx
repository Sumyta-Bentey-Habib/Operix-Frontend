import type {
  DocumentAiAnalysis as DocumentAiAnalysisResult,
  DocumentAiConfidence,
} from "../../types/document-ai.types";
import styles from "./DocumentAiAnalysis.module.css";

export const DOCUMENT_AI_STRINGS = {
  title: "AI Document Analysis",
  advisory: "AI-generated analysis",
  analyzing: "Analyzing document...",
  summary: "Summary",
  keyPoints: "Key Points",
  actionItems: "Action Items",
  importantDates: "Important Dates",
  risks: "Risks / Warnings",
  confidence: "Confidence",
  limitations: "Limitations",
  noOwner: "No owner mentioned",
  noDueDate: "No due date mentioned",
  meta: "AI run",
} as const;

const CONFIDENCE_LABEL: Record<DocumentAiConfidence, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export interface DocumentAiAnalysisProps {
  documentName: string;
  analysis: DocumentAiAnalysisResult | null;
  pending: boolean;
  error: string | null;
}

export const DocumentAiAnalysis = ({
  documentName,
  analysis,
  pending,
  error,
}: DocumentAiAnalysisProps) => (
  <section className={styles.panel} aria-label={`${DOCUMENT_AI_STRINGS.title} for ${documentName}`}>
    <header className={styles.header}>
      <div>
        <h4 className={styles.title}>{DOCUMENT_AI_STRINGS.title}</h4>
        <p className={styles.subtitle}>{documentName}</p>
      </div>
      <span className={styles.advisory}>{DOCUMENT_AI_STRINGS.advisory}</span>
    </header>

    {pending && (
      <p className={styles.status} role="status">
        {DOCUMENT_AI_STRINGS.analyzing}
      </p>
    )}

    {error && (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )}

    {analysis && !pending && (
      <div className={styles.result} aria-live="polite">
        <AnalysisSection title={DOCUMENT_AI_STRINGS.summary}>
          <p className={styles.body}>{analysis.summary}</p>
        </AnalysisSection>

        {analysis.keyPoints.length > 0 && (
          <AnalysisSection title={DOCUMENT_AI_STRINGS.keyPoints}>
            <TextList items={analysis.keyPoints} />
          </AnalysisSection>
        )}

        {analysis.actionItems.length > 0 && (
          <AnalysisSection title={DOCUMENT_AI_STRINGS.actionItems}>
            <ul className={styles.cardList}>
              {analysis.actionItems.map((item, index) => (
                <li className={styles.card} key={`${item.action}-${index}`}>
                  <strong>{item.action}</strong>
                  <span>
                    {item.ownerMentioned ?? DOCUMENT_AI_STRINGS.noOwner} ·{" "}
                    {item.dueDateMentioned ?? DOCUMENT_AI_STRINGS.noDueDate}
                  </span>
                </li>
              ))}
            </ul>
          </AnalysisSection>
        )}

        {analysis.importantDates.length > 0 && (
          <AnalysisSection title={DOCUMENT_AI_STRINGS.importantDates}>
            <ul className={styles.cardList}>
              {analysis.importantDates.map((item, index) => (
                <li className={styles.card} key={`${item.dateText}-${index}`}>
                  <strong>{item.dateText}</strong>
                  <span>{item.context}</span>
                </li>
              ))}
            </ul>
          </AnalysisSection>
        )}

        {analysis.risksOrWarnings.length > 0 && (
          <AnalysisSection title={DOCUMENT_AI_STRINGS.risks}>
            <TextList items={analysis.risksOrWarnings} />
          </AnalysisSection>
        )}

        <AnalysisSection title={DOCUMENT_AI_STRINGS.confidence}>
          <span className={styles.confidence} data-confidence={analysis.confidence}>
            {CONFIDENCE_LABEL[analysis.confidence]}
          </span>
        </AnalysisSection>

        {analysis.limitations.length > 0 && (
          <AnalysisSection title={DOCUMENT_AI_STRINGS.limitations}>
            <TextList items={analysis.limitations} />
          </AnalysisSection>
        )}

        <p className={styles.meta}>
          {DOCUMENT_AI_STRINGS.meta}: {analysis.meta.provider} · {analysis.meta.model} ·{" "}
          {analysis.meta.latencyMs} ms · {analysis.meta.attempts}{" "}
          {analysis.meta.attempts === 1 ? "attempt" : "attempts"}
        </p>
      </div>
    )}
  </section>
);

const AnalysisSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h5 className={styles.sectionTitle}>{title}</h5>
    {children}
  </section>
);

const TextList = ({ items }: { items: string[] }) => (
  <ul className={styles.textList}>
    {items.map((item, index) => (
      <li key={`${item}-${index}`}>{item}</li>
    ))}
  </ul>
);
