"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Team } from "@/features/teams";
import type { ManagementReport, ManagementReportFormValues } from "../../types/report.types";
import { reportToFormValues } from "../../utils/report-form";
import { validateReportPeriod } from "../../utils/report-date";
import { ReportTeamPicker } from "../ReportTeamPicker";
import styles from "../Reports.module.css";

export interface ReportFormProps {
  mode: "create" | "edit";
  report?: ManagementReport;
  pending: boolean;
  error: string | null;
  saveLabel: string;
  onSubmit: (values: ManagementReportFormValues) => void;
}

export const ReportForm = ({
  mode,
  report,
  pending,
  error,
  saveLabel,
  onSubmit,
}: ReportFormProps) => {
  const initialValues = useMemo(() => reportToFormValues(report), [report]);
  const [values, setValues] = useState<ManagementReportFormValues>(initialValues);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const update = (field: keyof ManagementReportFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = values.title.trim();

    if (!title) {
      setLocalError("Report title is required.");
      return;
    }

    if (mode === "create" && !values.teamId.trim()) {
      setLocalError("Choose a Team before saving this Draft.");
      return;
    }

    const periodError = validateReportPeriod(values.periodStart, values.periodEnd);
    if (periodError) {
      setLocalError(periodError);
      return;
    }

    setLocalError(null);
    onSubmit({ ...values, title });
  };

  const handleTeamSelect = (team: Team) => {
    update("teamId", team.id);
    setSelectedTeamName(team.name);
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <section className={styles.card}>
        <h2>Report Information</h2>
        <div className={styles.fields}>
          {mode === "create" ? (
            <div className={styles.field}>
              <span>Team *</span>
              {values.teamId && (
                <p className={styles.hint}>
                  Selected Team: {selectedTeamName || values.teamId} ({values.teamId})
                </p>
              )}
              <ReportTeamPicker selectedTeamId={values.teamId} onSelect={handleTeamSelect} />
            </div>
          ) : (
            <div className={styles.detailItem}>
              <span>Team ID</span>
              <strong>{values.teamId}</strong>
            </div>
          )}
          <label className={styles.field}>
            <span>Title *</span>
            <input
              className={styles.input}
              value={values.title}
              maxLength={180}
              onChange={(event) => update("title", event.target.value)}
            />
          </label>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Period Start *</span>
              <input
                className={styles.input}
                type="date"
                value={values.periodStart}
                onChange={(event) => update("periodStart", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Period End *</span>
              <input
                className={styles.input}
                type="date"
                value={values.periodEnd}
                onChange={(event) => update("periodEnd", event.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      <ReportTextArea
        label="Operational Summary"
        value={values.operationalSummary}
        onChange={(value) => update("operationalSummary", value)}
        maxLength={10000}
      />
      <section className={styles.card}>
        <h2>Work Summary</h2>
        <div className={styles.grid}>
          <ReportTextArea
            label="Completed Work"
            value={values.completedWorkSummary}
            onChange={(value) => update("completedWorkSummary", value)}
            maxLength={10000}
          />
          <ReportTextArea
            label="Pending Work"
            value={values.pendingWorkSummary}
            onChange={(value) => update("pendingWorkSummary", value)}
            maxLength={10000}
          />
          <ReportTextArea
            label="Overdue Work"
            value={values.overdueWorkSummary}
            onChange={(value) => update("overdueWorkSummary", value)}
            maxLength={10000}
          />
          <ReportTextArea
            label="Performance Summary"
            value={values.performanceSummary}
            onChange={(value) => update("performanceSummary", value)}
            maxLength={10000}
          />
        </div>
      </section>
      <section className={styles.card}>
        <h2>Management Review Content</h2>
        <div className={styles.grid}>
          <ReportTextArea
            label="Key Issues"
            value={values.keyIssues}
            onChange={(value) => update("keyIssues", value)}
            maxLength={10000}
          />
          <ReportTextArea
            label="Actions Taken"
            value={values.actionsTaken}
            onChange={(value) => update("actionsTaken", value)}
            maxLength={10000}
          />
          <ReportTextArea
            label="Next Period Plan"
            value={values.nextPeriodPlan}
            onChange={(value) => update("nextPeriodPlan", value)}
            maxLength={10000}
          />
          <ReportTextArea
            label="Remarks"
            value={values.remarks}
            onChange={(value) => update("remarks", value)}
            maxLength={2000}
          />
        </div>
      </section>
      {(localError || error) && <p className={styles.error}>{localError ?? error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton} disabled={pending}>
          {pending ? "Saving..." : saveLabel}
        </button>
      </div>
    </form>
  );
};

const ReportTextArea = ({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) => (
  <label className={styles.field}>
    <span>{label}</span>
    <textarea
      className={styles.textarea}
      value={value}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);
