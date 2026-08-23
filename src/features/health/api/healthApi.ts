import { apiRequest } from "@/lib/api";

export const healthApi = {
  get: (): Promise<unknown> => apiRequest("/health"),
};
