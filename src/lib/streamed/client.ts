export const STREAMED_ORIGIN = "https://streamed.pk";
export const STREAMED_API_BASE = `${STREAMED_ORIGIN}/api`;

export class StreamedApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "StreamedApiError";
    this.status = status;
  }
}

interface StreamedFetchInit extends RequestInit {
  next?: { revalidate?: number | false };
}

export interface StreamedFetchOptions {
  revalidate?: number | false;
  signal?: AbortSignal;
}

export async function streamedFetch<T>(
  path: string,
  { revalidate = 60, signal }: StreamedFetchOptions = {},
): Promise<T> {
  const init: StreamedFetchInit = {
    headers: { Accept: "application/json" },
    next: { revalidate },
    signal,
  };

  const response = await fetch(`${STREAMED_API_BASE}${path}`, init);

  if (!response.ok) {
    throw new StreamedApiError(
      `Streamed API request to ${path} failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
