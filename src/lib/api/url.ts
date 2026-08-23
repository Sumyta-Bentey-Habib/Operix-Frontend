import { API_BASE_URL } from "@/lib/config/env";

export type QueryScalar = string | number | boolean;
export type QueryParams = Record<string, QueryScalar | null | undefined>;

export const joinApiUrl = (path: string, query?: QueryParams, baseUrl = API_BASE_URL): string => {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${baseUrl}/${cleanPath}`);
  const queryString = buildQueryString(query);

  if (queryString) {
    url.search = queryString;
  }

  return url.toString();
};

export const buildQueryString = (query?: QueryParams): string => {
  if (!query) return "";

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      throw new Error("Array query values are not supported yet.");
    }

    params.set(key, String(value));
  });

  return params.toString();
};
