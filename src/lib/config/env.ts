export const parseApiBaseUrl = (value: string | undefined): string => {
  if (!value) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be an absolute URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must use http or https.");
  }

  if (value.endsWith("/")) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must not end with a slash.");
  }

  return value;
};

export const API_BASE_URL = parseApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
