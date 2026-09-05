import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBaseUrl, parseApiBaseUrl } from "@/lib/config/env";

describe("parseApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts absolute http and https URLs without a trailing slash", () => {
    expect(parseApiBaseUrl("http://localhost:5000/api/v1")).toBe("http://localhost:5000/api/v1");
    expect(parseApiBaseUrl("https://api.operix.test/api/v1")).toBe(
      "https://api.operix.test/api/v1",
    );
  });

  it("rejects missing, relative, unsafe protocol, and trailing slash values", () => {
    expect(() => parseApiBaseUrl(undefined)).toThrow("NEXT_PUBLIC_API_BASE_URL is required.");
    expect(() => parseApiBaseUrl("/api/v1")).toThrow(
      "NEXT_PUBLIC_API_BASE_URL must be an absolute URL.",
    );
    expect(() => parseApiBaseUrl("file:///tmp/api")).toThrow(
      "NEXT_PUBLIC_API_BASE_URL must use http or https.",
    );
    expect(() => parseApiBaseUrl("http://localhost:5000/api/v1/")).toThrow(
      "NEXT_PUBLIC_API_BASE_URL must not end with a slash.",
    );
  });

  it("validates the public API base URL lazily when requested", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", undefined);

    expect(() => getApiBaseUrl()).toThrow("NEXT_PUBLIC_API_BASE_URL is required.");

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.operix.test/api/v1");

    expect(getApiBaseUrl()).toBe("https://api.operix.test/api/v1");
  });
});
