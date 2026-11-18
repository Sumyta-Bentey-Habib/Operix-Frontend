import type { TaskAssignmentRecommendationResponse } from "../../types/task.types";
import styles from "./TaskAssignmentRecommendations.module.css";

interface TaskAssignmentRecommendationsProps {
  result: TaskAssignmentRecommendationResponse | null;
  loading: boolean;
  error: string | null;
  selectedMemberId: string;
  onGenerate: () => void;
  onSelect: (member: { id: string; name: string }) => void;
}

const formatPercent = (value: number | null) => (value === null ? "Not available" : `${value}%`);

export const TaskAssignmentRecommendations = ({
  result,
  loading,
  error,
  selectedMemberId,
  onGenerate,
  onSelect,
}: TaskAssignmentRecommendationsProps) => (
  <section className={styles.panel} aria-labelledby="assignment-ai-title">
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Decision support</p>
        <h3 id="assignment-ai-title">AI Assignment Recommendations</h3>
        <p>Compare advisory recommendations with the complete Member list below.</p>
      </div>
      <button type="button" onClick={onGenerate} disabled={loading} className={styles.generate}>
        {loading ? "Generating..." : result ? "Generate Again" : "Generate Recommendations"}
      </button>
    </div>

    {loading && (
      <p className={styles.status} role="status">
        Reviewing current Operix metrics...
      </p>
    )}
    {error && (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )}

    {result && (
      <div className={styles.results}>
        <div className={styles.summary}>
          <span>
            {result.decision === "RECOMMEND" ? "Recommendation ready" : "Manual selection advised"}
          </span>
          <strong>{result.confidence} confidence</strong>
          <p>{result.summary}</p>
        </div>

        {result.recommendations.length > 0 && (
          <ol className={styles.cards}>
            {result.recommendations.map((recommendation) => {
              const selected = recommendation.member.id === selectedMemberId;
              return (
                <li key={recommendation.member.id} className={styles.card}>
                  <div className={styles.identity}>
                    <span className={styles.rank}>#{recommendation.rank}</span>
                    <div>
                      <strong>{recommendation.member.name}</strong>
                      <p>
                        {[recommendation.member.designation, recommendation.member.teamName]
                          .filter(Boolean)
                          .join(" · ") || "Member"}
                      </p>
                    </div>
                  </div>
                  <dl className={styles.metrics}>
                    <div>
                      <dt>Active</dt>
                      <dd>{recommendation.metrics.activeTasks}</dd>
                    </div>
                    <div>
                      <dt>Overdue</dt>
                      <dd>{recommendation.metrics.overdueTasks}</dd>
                    </div>
                    <div>
                      <dt>Completion</dt>
                      <dd>{formatPercent(recommendation.metrics.completionRate)}</dd>
                    </div>
                    <div>
                      <dt>On time</dt>
                      <dd>{formatPercent(recommendation.metrics.onTimeRate)}</dd>
                    </div>
                    <div>
                      <dt>Relevant Tasks</dt>
                      <dd>
                        {recommendation.metrics.relevantCategoryCompletedTasks ?? "Not available"}
                      </dd>
                    </div>
                  </dl>
                  <div className={styles.reasoning}>
                    <strong>Why suggested</strong>
                    <p>{recommendation.rationale}</p>
                  </div>
                  {recommendation.strengths.length > 0 && (
                    <div className={styles.listBlock}>
                      <strong>Strengths</strong>
                      <ul>
                        {recommendation.strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recommendation.cautions.length > 0 && (
                    <div className={styles.listBlock}>
                      <strong>Cautions</strong>
                      <ul>
                        {recommendation.cautions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.select}
                    aria-pressed={selected}
                    onClick={() => onSelect(recommendation.member)}
                  >
                    {selected ? "Selected" : "Select Member"}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        <div className={styles.limitations}>
          <strong>Limitations</strong>
          <ul>
            {result.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    )}
  </section>
);
