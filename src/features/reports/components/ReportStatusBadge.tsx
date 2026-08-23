import type { ManagementReportStatus } from "../types/report.types";
import styles from "./Reports.module.css";

export const ReportStatusBadge = ({ status }: { status: ManagementReportStatus }) => {
  const warning = status === "SUBMITTED" || status === "UNDER_REVIEW";
  const danger = status === "REVISION_REQUIRED";

  return (
    <span
      className={
        danger
          ? `${styles.status} ${styles.statusDanger}`
          : warning
            ? `${styles.status} ${styles.statusWarning}`
            : styles.status
      }
    >
      {status.replaceAll("_", " ")}
    </span>
  );
};
