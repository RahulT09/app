"use client";

import type { ApiResponse } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];

  constructor(message: string, status: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: isFormData
      ? options.headers
      : { "content-type": "application/json", ...(options.headers ?? {}) },
    credentials: "same-origin",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const body: ApiResponse<T> = contentType.includes("application/json")
    ? await res.json()
    : ({ success: res.ok } as ApiResponse<T>);

  if (!res.ok || body.success === false) {
    throw new ApiError(
      body.message ?? "Something went wrong",
      res.status,
      body.errors,
    );
  }

  return (body.data ?? body) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: "POST", body: json ? JSON.stringify(json) : undefined }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),
  patch: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: "PATCH", body: json ? JSON.stringify(json) : undefined }),
  patchForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "PATCH", body: form }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
