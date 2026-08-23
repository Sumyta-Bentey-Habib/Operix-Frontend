import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import type { PaginationMeta } from "@/types/pagination";
import type { Submission } from "../../types/submission.types";
import { getSubmissionErrorView } from "../submission-errors";
import { SubmissionCard } from "../SubmissionCard";
import styles from "./SubmissionList.module.css";

export interface SubmissionListProps {
  submissions: Submission[];
  meta: PaginationMeta;
  loading: boolean;
  error: unknown;
  canReviewLatest: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onReview: (submission: Submission) => void;
}

export const SubmissionList = ({
  submissions,
  meta,
  loading,
  error,
  canReviewLatest,
  onRetry,
  onPageChange,
  onReview,
}: SubmissionListProps) => (
  <div className={styles.list}>
    {loading && <LoadingState message="Loading Submissions..." />}
    {Boolean(error) && !loading && (
      <ErrorState
        title={getSubmissionErrorView(error).title}
        message={getSubmissionErrorView(error).message}
        onRetry={onRetry}
      />
    )}
    {!loading && !error && submissions.length === 0 && (
      <EmptyState title="No Submissions found" message="This Task has no Submissions yet." />
    )}
    {!loading &&
      !error &&
      submissions.map((submission, index) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          latest={meta.page === 1 && index === 0}
          canReview={canReviewLatest && meta.page === 1 && index === 0}
          onReview={onReview}
        />
      ))}
    {!loading && !error && submissions.length > 0 && (
      <Pagination meta={meta} onPageChange={onPageChange} disabled={loading} />
    )}
  </div>
);
