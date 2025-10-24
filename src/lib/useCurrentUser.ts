// path: src/lib/useCurrentUser.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { SessionUser } from "@/lib/auth";

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR("/api/me", (url) =>
    fetcher<SessionUser>(url),
  );
  return { user: data ?? null, error, isLoading };
}
