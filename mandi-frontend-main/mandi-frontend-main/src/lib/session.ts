import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { backendJson } from "@/lib/backend";
import type { ApiResponse, User } from "@/lib/types";

/**
 * The backend is always the source of truth for who's logged in — we never
 * decode the JWT ourselves here. This is memoized per-request so every
 * server component in a page tree can call it without hitting the API
 * multiple times.
 */
export const getServerUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("JWT_TOKEN");
  if (!token) return null;

  const cookieHeader = `JWT_TOKEN=${token.value}`;

  const res = await backendJson<ApiResponse<User>>("/api/profile/me", {
    cookie: cookieHeader,
  });

  if (res.status !== 200 || !res.body?.success || !res.body.data) {
    return null;
  }

  return res.body.data;
});

export async function requireUser(): Promise<User | null> {
  return getServerUser();
}
