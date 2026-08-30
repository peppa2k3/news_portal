"use client";

import type { ApiResponse } from "@/types";

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "ADMIN_API_ERROR",
    readonly fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export async function adminApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const isFormData = init.body instanceof FormData;
  const response = await fetch(`/api/backend${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !body?.success) {
    const error = body && !body.success ? body.error : null;
    throw new AdminApiError(
      error?.message ?? "Không thể kết nối máy chủ",
      response.status,
      error?.code,
      error?.fields,
    );
  }
  return body.data;
}

export const toQuery = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const result = params.toString();
  return result ? `?${result}` : "";
};
