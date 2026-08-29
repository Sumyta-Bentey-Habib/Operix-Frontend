import Link from "next/link";
import type { Submission } from "../../types/submission.types";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import styles from "./SubmissionCard.module.css";

export interface SubmissionCardProps {
  submission: Submission;
  latest: boolean;
  canReview: boolean;
  onReview: (submission: Submission) => void;
}

export const SubmissionCard = ({
  submission,
  latest,
  canReview,
  onReview,
}: SubmissionCardProps) => (
  <article className={styles.card}>
    <header className={styles.header}>
      <div>
        <h3 className={styles.title}>
          Version {submission.version}
          {latest && <span className={styles.badge}>Latest</span>}
        </h3>
        <p className={styles.meta}>Submitted {formatDisplayDate(submission.submittedAt)}</p>
      </div>
      <div className={styles.actions}>
        <Link href={`/submissions/${submission.id}`}>View</Link>
        {canReview && (
          <button type="button" onClick={() => onReview(submission)}>
            Review
          </button>
        )}
      </div>
    </header>
    <p className={styles.text}>{submission.submissionText ?? "No submission text provided."}</p>
    <dl className={styles.details}>
      <div>
        <dt>Submitted By</dt>
        <dd>{obfuscateId(submission.submittedById, "MEM")}</dd>
      </div>
      <div>
        <dt>Attachments</dt>
        <dd>{submission.attachments?.length ?? 0}</dd>
      </div>
      <div>
        <dt>Created</dt>
        <dd>{formatDisplayDate(submission.createdAt)}</dd>
      </div>
    </dl>
  </article>
);
