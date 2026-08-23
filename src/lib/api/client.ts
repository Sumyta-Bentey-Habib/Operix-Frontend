import { OperixApiError, isAbortError } from "./error";
import { joinApiUrl, QueryParams } from "./url";

type ApiBody = BodyInit | null;

export interface ApiRequestOptions extends Omit<RequestInit, "body" | "credentials"> {
  body?: ApiBody;
  json?: unknown;
  query?: QueryParams;
  credentials?: RequestCredentials;
}

export interface DownloadResult {
  blob: Blob;
  filename: string | null;
}

const parseJsonSafely = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const parseErrorPayload = async (
  response: Response,
): Promise<{ message: string; code: string; details: unknown }> => {
  const payload = await parseJsonSafely(response);

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    return {
      message: typeof record.message === "string" ? record.message : "The request failed.",
      code: typeof record.code === "string" ? record.code : "API_ERROR",
      details: "details" in record ? record.details : null,
    };
  }

  return {
    message: typeof payload === "string" ? payload : "The request failed.",
    code: "API_ERROR",
    details: null,
  };
};

const createRequestInit = (options: ApiRequestOptions = {}): RequestInit => {
  const { json, body, headers, query: _query, ...rest } = options;
  void _query;

  if (json !== undefined && body !== undefined) {
    throw new Error("Use either json or body, not both.");
  }

  const requestHeaders = new Headers(headers);
  let requestBody = body;

  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(json);
  }

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  return {
    ...rest,
    headers: requestHeaders,
    body: requestBody,
    credentials: options.credentials ?? "include",
  };
};

const fetchApi = async (path: string, options: ApiRequestOptions = {}): Promise<Response> => {
  try {
    return await fetch(joinApiUrl(path, options.query), createRequestInit(options));
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new OperixApiError("Unable to connect to the Operix API.", {
      status: 0,
      code: "NETWORK_ERROR",
      details: null,
      cause: error,
    });
  }
};

export const apiRequest = async <T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const response = await fetchApi(path, options);

  if (!response.ok) {
    const payload = await parseErrorPayload(response);
    throw new OperixApiError(payload.message, {
      status: response.status,
      code: payload.code,
      details: payload.details,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseJsonSafely(response)) as T;
};

export const apiMultipartRequest = async <T = unknown>(
  path: string,
  formData: FormData,
  options: Omit<ApiRequestOptions, "body" | "json"> = {},
): Promise<T> => apiRequest<T>(path, { ...options, body: formData });

const readFilename = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) return null;

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1]);
  }

  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const plainMatch = contentDisposition.match(/filename=([^;]+)/i);
  return plainMatch?.[1]?.trim() ?? null;
};

export const apiDownload = async (
  path: string,
  options: ApiRequestOptions = {},
): Promise<DownloadResult> => {
  const response = await fetchApi(path, options);

  if (!response.ok) {
    const payload = await parseErrorPayload(response);
    throw new OperixApiError(payload.message, {
      status: response.status,
      code: payload.code,
      details: payload.details,
    });
  }

  return {
    blob: await response.blob(),
    filename: readFilename(response.headers.get("Content-Disposition")),
  };
};
