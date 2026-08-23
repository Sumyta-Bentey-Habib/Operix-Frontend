import { apiRequest } from "@/lib/api";
import type { CreateReviewInput, TaskReview } from "../types/review.types";

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
};
