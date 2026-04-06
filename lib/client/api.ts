import type {
  ApiFailurePayload,
  ApiSuccessPayload,
} from "@/lib/contracts/api"

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
  }
}

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init)
  const payload = (await response.json()) as
    | ApiSuccessPayload<T>
    | ApiFailurePayload
    | undefined

  if (!response.ok || !payload || !("success" in payload) || !payload.success) {
    const error =
      payload && "success" in payload && !payload.success
        ? payload.error
        : {
            code: "BAD_RESPONSE",
            message: "Unexpected response from server.",
          }

    throw new ApiClientError(
      error.message,
      response.status,
      error.code,
      error.fieldErrors,
    )
  }

  return payload.data
}

export function postJson<TResponse, TRequest>(
  url: string,
  body: TRequest,
): Promise<TResponse> {
  return apiRequest<TResponse>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
