export type TaskReviewAction = "APPROVE" | "REQUEST_REVISION";

export interface TaskReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  action: TaskReviewAction;
  feedback: string | null;
  reviewedAt: string;
  createdAt: string;
}

export interface CreateReviewInput {
  action: TaskReviewAction;
  feedback?: string;
}
