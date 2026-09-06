import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { mapDashboardError } from "../../utils/dashboard-errors";
import styles from "../DashboardAnalytics.module.css";

export const SectionShell = ({
  title,
  description,
  loading,
  error,
  onRetry,
  children,
}: {
  title: string;
  description?: string;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  children: React.ReactNode;
}) => (
  <section className={styles.card}>
    <div className={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
    {loading ? (
      <LoadingState message={`Loading ${title}...`} />
    ) : error ? (
      <ErrorState message={mapDashboardError(error)} onRetry={() => void onRetry()} />
    ) : (
      children
    )}
  </section>
);
