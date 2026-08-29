import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import type { ManagementReportReviewSummary } from "../types/report.types";
import styles from "./Reports.module.css";

export const ReportReviewSummary = ({
  review,
  prominent = false,
}: {
  review: ManagementReportReviewSummary | null;
  prominent?: boolean;
}) => (
  <article className={prominent ? `${styles.summaryCard} ${styles.notice}` : styles.summaryCard}>
    <h3>{prominent ? "Revision Requested" : "Latest Review"}</h3>
    {review ? (
      <div className={styles.stack}>
        <p>
          {review.action.replaceAll("_", " ")} by {obfuscateId(review.reviewerId, "REV")} on{" "}
          {formatDisplayDate(review.reviewedAt)}
        </p>
        <p>Version Reference: {obfuscateId(review.reportVersionId, "VER")}</p>
        {review.feedback && <p>Feedback: {review.feedback}</p>}
      </div>
    ) : (
      <p>No review recorded for the latest submitted version.</p>
    )}
  </article>
);
