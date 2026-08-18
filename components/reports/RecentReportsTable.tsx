"use client";

import React from "react";
import styles from "./RecentReportsTable.module.css";
import { FileDocIcon, DownloadIcon, MoreDotsIcon } from "@/components/icons";
import { RECENT_REPORTS_DATA } from "@/data/reportsData";
import { APP_STRINGS } from "@/constants/strings";

export const RecentReportsTable: React.FC = () => {
  return (
    <section
      className={styles.card}
      aria-label={APP_STRINGS.headers.recentReports}
    >
      <h2 className={styles.title}>{APP_STRINGS.headers.recentReports}</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeadRow}>
              <th className={styles.th}>
                {APP_STRINGS.tableColumns.reportName}
              </th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.type}</th>
              <th className={styles.th}>
                {APP_STRINGS.tableColumns.generatedDate}
              </th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.status}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_REPORTS_DATA.map((item) => (
              <tr key={item.id} className={styles.tableBodyRow}>
                <td className={styles.td}>
                  <div className={styles.nameCell}>
                    <div className={styles.fileIconWrapper}>
                      <FileDocIcon size={22} color="#059669" />
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
                  <span
                    className={
                      item.status === "Generated"
                        ? styles.statusBadgeGenerated
                        : styles.statusBadgePending
                    }
                  >
                    {item.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      aria-label={APP_STRINGS.ariaLabels.downloadReport}
                      title={APP_STRINGS.actions.download}
                    >
                      <DownloadIcon size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      aria-label={APP_STRINGS.ariaLabels.reportOptions}
                      title={APP_STRINGS.actions.moreOptions}
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
