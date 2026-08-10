import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

/**
 * Authenticated fetch wrapper.
 * Automatically injects the Bearer token from next-auth session.
 */
async function authFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const session = await getSession();
  const { params, headers: extraHeaders, ...rest } = options;

  // Build URL with query params
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const search = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== "") {
        search.set(key, String(val));
      }
    }
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(rest.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(session?.user?.accessToken
        ? { Authorization: `Bearer ${session.user.accessToken}` }
        : {}),
      ...extraHeaders,
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const err = errBody as { error?: string; message?: string };
    throw new Error(
      err.message ||
        err.error ||
        `HTTP ${res.status}: ${res.statusText}`
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ─── Convenience methods ────────────────────────────────────────────────────

export const api = {
  get: <T = unknown>(endpoint: string, params?: FetchOptions["params"]) =>
    authFetch<T>(endpoint, { method: "GET", params }),

  post: <T = unknown>(endpoint: string, body?: unknown) =>
    authFetch<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown) =>
    authFetch<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, body?: unknown) =>
    authFetch<T>(endpoint, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};

export default api;
