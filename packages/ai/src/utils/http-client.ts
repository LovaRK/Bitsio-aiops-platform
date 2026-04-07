export interface PostJsonWithTimeoutInput<TBody> {
  url: string;
  body: TBody;
  headers?: Record<string, string>;
  timeoutMs: number;
  timeoutReason: string;
  operationName: string;
}

export async function postJsonWithTimeout<TBody, TResponse>(
  input: PostJsonWithTimeoutInput<TBody>
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(input.timeoutReason), input.timeoutMs);

  try {
    const response = await fetch(input.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(input.headers ?? {})
      },
      signal: controller.signal,
      body: JSON.stringify(input.body)
    });

    if (!response.ok) {
      throw new Error(`${input.operationName} failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}
