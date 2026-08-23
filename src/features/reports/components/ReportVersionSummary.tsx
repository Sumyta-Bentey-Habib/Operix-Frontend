import { formatDisplayDate } from "@/utils/date";
import type { ManagementReportVersionSummary } from "../types/report.types";
import styles from "./Reports.module.css";

export const ReportVersionSummary = ({
  version,
}: {
  version: ManagementReportVersionSummary | null;
}) => (
  <article className={styles.summaryCard}>
    <h3>Latest Submitted Version</h3>
    {version ? (
      <p>
        Version {version.version} submitted {formatDisplayDate(version.submittedAt)}
      </p>
    ) : (
      <p>No submitted version yet.</p>
    )}
  </article>
);
