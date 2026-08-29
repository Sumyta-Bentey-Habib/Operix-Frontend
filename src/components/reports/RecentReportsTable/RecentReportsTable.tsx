"use client";

import React from "react";
import styles from "./RecentReportsTable.module.css";
import { FileDocIcon, DownloadIcon, MoreDotsIcon } from "@/components/icons";
import { RECENT_REPORTS_DATA } from "@/data/reportsData";
import { APP_STRINGS } from "@/constants/strings";
import { CSS_VARS } from "@/constants/colors";
import type { ReportItem, ReportStatus } from "@/types/dashboard";

export interface RecentReportsTableProps {
  reports?: ReportItem[];
  className?: string;
  onDownloadReport?: (reportId: string) => void;
  onReportOptions?: (reportId: string) => void;
}

export const RecentReportsTable: React.FC<RecentReportsTableProps> = ({
  reports = RECENT_REPORTS_DATA,
  className,
  onDownloadReport,
  onReportOptions,
}) => {
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;

  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case "Generated":
        return styles.statusBadgeGenerated;
      case "Pending":
        return styles.statusBadgePending;
      case "Failed":
        return styles.statusBadgeFailed;
      default:
        return styles.statusBadgeGenerated;
    }
  };

  return (
    <section className={cardClassName} aria-label={APP_STRINGS.headers.recentReports}>
      <h2 className={styles.title}>{APP_STRINGS.headers.recentReports}</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeadRow}>
              <th className={styles.th}>{APP_STRINGS.tableColumns.reportName}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.type}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.generatedDate}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.status}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((item) => (
              <tr key={item.id} className={styles.tableBodyRow}>
                <td className={styles.td}>
                  <div className={styles.nameCell}>
                    <div className={styles.fileIconWrapper} aria-hidden="true">
                      <FileDocIcon size={22} color={CSS_VARS.primaryEmerald} />
                    </div>
                    <span className={styles.reportName}>{item.name}</span>
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={styles.typeText}>{item.type}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.dateText}>{item.generatedDate}</span>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      aria-label={`${APP_STRINGS.ariaLabels.downloadReport}: ${item.name}`}
                      title={APP_STRINGS.actions.download}
                      onClick={() => onDownloadReport?.(item.id)}
                    >
                      <DownloadIcon size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      aria-label={`${APP_STRINGS.ariaLabels.reportOptions}: ${item.name}`}
                      title={APP_STRINGS.actions.moreOptions}
                      onClick={() => onReportOptions?.(item.id)}
                    >
                      <MoreDotsIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
