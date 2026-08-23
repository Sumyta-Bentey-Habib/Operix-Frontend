"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { MemberPerformanceDetails } from "../MemberPerformanceDetails";
import { MemberPerformanceList } from "../MemberPerformanceList";
import { TeamPerformancePicker } from "../TeamPerformancePicker";
import styles from "../Performance.module.css";

export const PerformanceOverview = () => {
  const { viewer, hydrationStatus } = useAuth();

  if (hydrationStatus === "IDLE" || hydrationStatus === "LOADING") {
    return <LoadingState message="Loading Performance..." />;
  }

  if (!viewer) {
    return <ErrorState title="Performance unavailable" message="Sign in to view Performance." />;
  }

  if (viewer.role === "MEMBER") {
    return <MemberPerformanceDetails memberId={viewer.userId} title="My Performance" />;
  }

  return (
    <div className={styles.layout}>
      <section className={styles.hero}>
        <div>
          <h1>Performance & Workload</h1>
          <p>
            All-time task execution metrics and current workload, calculated from live Operix data.
          </p>
        </div>
      </section>
      <MemberPerformanceList viewer={viewer} />
      <TeamPerformancePicker />
    </div>
  );
};
