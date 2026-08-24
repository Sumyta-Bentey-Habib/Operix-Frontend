"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useAdmins } from "@/features/admins/hooks/use-admins";
import { useTeams } from "@/features/teams/hooks/use-teams";
import { formatDisplayDate } from "@/utils/date";
import { useReports } from "../../hooks/use-reports";
import {
  canCreateManagementReport,
  canFilterReportsByAdmin,
  type ManagementReportFilterState,
  type ManagementReportStatus,
} from "../../types/report.types";
import { formatReportPeriod } from "../../utils/report-date";
import { getReportErrorMessage } from "../report-errors";
import { ReportStatusBadge } from "../ReportStatusBadge";
import styles from "../Reports.module.css";

const REPORT_STATUSES: ManagementReportStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUIRED",
  "APPROVED",
];

const ReportAdminFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const admins = useAdmins();

  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <label htmlFor="admin-filter">Admin</label>
        <div className={styles.compactPager}>
          <span>
            Page {admins.meta.page}/{admins.meta.totalPages || 1}
          </span>
          <button
            type="button"
            className={styles.compactPagerBtn}
            disabled={admins.loading || admins.meta.page <= 1}
            onClick={() => admins.setPage(admins.meta.page - 1)}
            title="Previous Admins"
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.compactPagerBtn}
            disabled={admins.loading || admins.meta.page >= admins.meta.totalPages}
            onClick={() => admins.setPage(admins.meta.page + 1)}
            title="Next Admins"
          >
            ›
          </button>
        </div>
      </div>
      <select
        id="admin-filter"
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All Admins</option>
        {admins.admins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.name} ({admin.id})
          </option>
        ))}
      </select>
      {admins.error && <span className={styles.error}>Unable to load Admin options.</span>}
    </div>
  );
};

const ReportFilters = ({
  filters,
  setFilters,
  onApply,
  onReset,
  showAdminFilter,
}: {
  filters: ManagementReportFilterState;
  setFilters: (filters: ManagementReportFilterState) => void;
  onApply: () => void;
  onReset: () => void;
  showAdminFilter: boolean;
}) => {
  const teams = useTeams();

  return (
    <section className={styles.filterCard}>
      <div className={styles.filterGrid}>
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label htmlFor="report-search">Search Report Title</label>
          </div>
          <input
            id="report-search"
            className={styles.input}
            value={filters.q}
            maxLength={100}
            onChange={(event) => setFilters({ ...filters, q: event.target.value })}
            placeholder="Filter by report title..."
          />
        </div>

        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label htmlFor="status-filter">Status</label>
          </div>
          <select
            id="status-filter"
            className={styles.select}
            value={filters.status}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: event.target.value as ManagementReportFilterState["status"],
              })
            }
          >
            <option value="ALL">All Statuses</option>
            {REPORT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label htmlFor="team-filter">Team</label>
            <div className={styles.compactPager}>
              <span>
                Page {teams.meta.page}/{teams.meta.totalPages || 1}
              </span>
              <button
                type="button"
                className={styles.compactPagerBtn}
                disabled={teams.loading || teams.meta.page <= 1}
                onClick={() => teams.setPage(teams.meta.page - 1)}
                title="Previous Teams"
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.compactPagerBtn}
                disabled={teams.loading || teams.meta.page >= teams.meta.totalPages}
                onClick={() => teams.setPage(teams.meta.page + 1)}
                title="Next Teams"
              >
                ›
              </button>
            </div>
          </div>
          <select
            id="team-filter"
            className={styles.select}
            value={filters.teamId}
            onChange={(event) => setFilters({ ...filters, teamId: event.target.value })}
          >
            <option value="">All visible Teams</option>
            {teams.teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.id})
              </option>
            ))}
          </select>
          {teams.error && <span className={styles.error}>Unable to load Team options.</span>}
        </div>

        {showAdminFilter && (
          <ReportAdminFilter
            value={filters.adminId}
            onChange={(adminId) => setFilters({ ...filters, adminId })}
          />
        )}
      </div>

      <div className={styles.filterActionsRow}>
        <button type="button" className={styles.secondaryButton} onClick={onReset}>
          Reset Filters
        </button>
        <button type="button" className={styles.primaryButton} onClick={onApply}>
          Apply Filters
        </button>
      </div>
    </section>
  );
};

export const ReportsPageContent = () => {
  const { viewer } = useAuth();
  const {
    reports,
    meta,
    loading,
    error,
    draftFilters,
    setDraftFilters,
    setPage,
    applyFilters,
    resetFilters,
    refresh,
  } = useReports(viewer);

  if (!viewer) return null;

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>OPERATIONAL GOVERNANCE & ANALYTICS</p>
          <h1>Management Reports</h1>
          <p className={styles.description}>
            Create, submit, and review Admin-authored operational reports using live backend data.
          </p>
        </div>
        {canCreateManagementReport(viewer) && (
          <Link className={styles.primaryButton} href="/reports/new">
            + Create Draft
          </Link>
        )}
      </header>

      <ReportFilters
        filters={draftFilters}
        setFilters={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        showAdminFilter={canFilterReportsByAdmin(viewer.role)}
      />

      <section className={styles.card}>
        {loading && <LoadingState message="Loading Reports..." />}
        {error && !loading && (
          <ErrorState message={getReportErrorMessage(error)} onRetry={() => void refresh()} />
        )}
        {!loading && !error && reports.length === 0 && (
          <EmptyState title="No Reports found" message="No Management Reports match this view." />
        )}
        {!loading && !error && reports.length > 0 && (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Team ID</th>
                    <th>Admin ID</th>
                    <th>Latest Version</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <strong>{report.title}</strong>
                      </td>
                      <td>{formatReportPeriod(report.periodStart, report.periodEnd)}</td>
                      <td>
                        <ReportStatusBadge status={report.status} />
                      </td>
                      <td>{report.teamId}</td>
                      <td>{report.adminId}</td>
                      <td>
                        {report.latestSubmittedVersion
                          ? `V${report.latestSubmittedVersion.version}`
                          : "—"}
                      </td>
                      <td>{formatDisplayDate(report.updatedAt)}</td>
                      <td>
                        <Link className={styles.link} href={`/reports/${report.id}`}>
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
          </>
        )}
      </section>
    </section>
  );
};
