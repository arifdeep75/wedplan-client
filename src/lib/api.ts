
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Small fetch wrapper for the WedPlan API.
 * - always sends cookies (better-auth sessions)
 * - normalizes error messages
 * - never treats a `success: false` payload as a success
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const result = (await response.json().catch(() => null)) as
    | (ApiResponse & T)
    | null;

  if (!response.ok || (result && result.success === false)) {
    throw new ApiError(
      result?.message || "Something went wrong. Please try again.",
      response.status
    );
  }

  return result as T;
}
