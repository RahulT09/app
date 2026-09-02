import "server-only";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

export interface BackendResult<T = unknown> {
  status: number;
  body: T;
  setCookies: string[];
}

/**
 * Low-level call to the Express API from the Next.js server.
 * Never called from client components — the backend origin and
 * its JWT secret stay server-side only.
 */
export async function backendFetch<T = unknown>(
  path: string,
  init: {
    method?: string;
    body?: BodyInit | null;
    headers?: HeadersInit;
    cookie?: string | null;
    duplex?: "half";
  } = {},
): Promise<BackendResult<T>> {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("cookie", init.cookie);

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body,
      cache: "no-store",
      redirect: "manual",
      // Required by undici when streaming a request body through.
      ...(init.body ? { duplex: "half" as const } : {}),
    });
  } catch (err) {
    // Backend is unreachable (wrong BACKEND_URL, cold start, network error).
    // Return a safe empty-body 503 so pages degrade gracefully instead of
    // crashing the entire server component tree with an unhandled error.
    console.error(`[backend] fetch failed for ${path}:`, err);
    return { status: 503, body: null as unknown as T, setCookies: [] };
  }

  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];

  let body: T;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = (await res.json()) as T;
  } else {
    body = (await res.text()) as unknown as T;
  }

  return { status: res.status, body, setCookies };
}

/** Convenience JSON helper for Server Components / route handlers. */
export async function backendJson<T = unknown>(
  path: string,
  init: {
    method?: string;
    json?: unknown;
    cookie?: string | null;
  } = {},
): Promise<BackendResult<T>> {
  const headers: HeadersInit = {};
  let body: string | undefined;

  if (init.json !== undefined) {
    (headers as Record<string, string>)["content-type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  return backendFetch<T>(path, {
    method: init.method ?? (init.json ? "POST" : "GET"),
    headers,
    body,
    cookie: init.cookie,
  });
}
