import { DatePicker } from "@/components/ui/DatePicker";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { formatDashboardAsOf } from "../../utils/dashboard-format";
import type { DashboardOverviewResponse } from "../../types/dashboard.types";
import styles from "../DashboardAnalytics.module.css";

export const DashboardAnalyticsHeader = ({
  name,
  role,
  overview,
  selectedDate,
  onDateChange,
}: {
  name: string;
  role?: string | null;
  overview: DashboardOverviewResponse | null;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}) => {
  const roleLabel =
    role === "SUPER_ADMIN"
      ? DASHBOARD_STRINGS.roles.superAdmin
      : role === "ADMIN"
        ? DASHBOARD_STRINGS.roles.admin
        : DASHBOARD_STRINGS.roles.member;
  const defaultAsOf = overview ? overview.context.asOf.slice(0, 10) : "";
  const activeDate = selectedDate || defaultAsOf;

  return (
    <section className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>{DASHBOARD_STRINGS.hero.eyebrow}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h1>{DASHBOARD_STRINGS.hero.heading}</h1>
          {role ? (
            <span className={styles.roleBadge} data-role={role}>
              {roleLabel}
            </span>
          ) : null}
        </div>
        <p>
          {DASHBOARD_STRINGS.hero.welcomePrefix} {name}
          {DASHBOARD_STRINGS.hero.welcomeSuffix}
        </p>
      </div>
      <div className={styles.contextPill}>
        <span>{DASHBOARD_STRINGS.hero.asOfLabel}</span>
        <DatePicker
          mode="single"
          value={activeDate}
          onChangeDate={onDateChange}
          placeholder={
            overview
              ? formatDashboardAsOf(overview.context.asOf)
              : DASHBOARD_STRINGS.hero.datePickerPlaceholder
          }
          triggerClassName={styles.contextDatePickerTrigger}
          ariaLabel={DASHBOARD_STRINGS.hero.datePickerAria}
        />
      </div>
    </section>
  );
};
