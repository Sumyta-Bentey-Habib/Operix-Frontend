import { apiRequest } from "@/lib/api";
import type { CreateReviewInput, TaskReview } from "../types/review.types";
import type { SubmissionAiReviewResponse } from "../types/submission-ai.types";

const normalizeReviewInput = (input: CreateReviewInput): CreateReviewInput => {
  const feedback = input.feedback?.trim();

  if (!feedback) {
    return {
      action: input.action,
    };
  }

  return {
    action: input.action,
    feedback,
  };
};

export const reviewApi = {
  create: (submissionId: string, input: CreateReviewInput): Promise<TaskReview> =>
    apiRequest(`/submissions/${submissionId}/reviews`, {
      method: "POST",
      json: normalizeReviewInput(input),
    }),
  /**
   * Advisory analysis only. It sends no body, so the server owns every prompt
   * rule, and it never mutates the Submission, Revision, or Task.
   */
  analyze: (submissionId: string, signal?: AbortSignal): Promise<SubmissionAiReviewResponse> =>
    apiRequest(`/submissions/${submissionId}/ai-review`, {
      method: "POST",
      ...(signal ? { signal } : {}),
    }),
};
