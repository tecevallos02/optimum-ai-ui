// path: src/lib/fetcher.ts

/**
 * Smart fetcher for both Server and Client Components.
 */
export async function fetcher<T>(
  input: string,
  init?: RequestInit,
  opts?: { throwOnError?: boolean; cache?: RequestCache },
): Promise<T | null> {
  const url = await toAbsoluteUrl(input);
  const res = await fetch(url, {
    cache: opts?.cache ?? "no-store",
    ...init,
  });

  if (!res.ok) {
    if (opts?.throwOnError) {
      const text = await safeText(res);
      throw new Error(
        `HTTP ${res.status} ${res.statusText}${text ? ` – ${text}` : ""}`,
      );
    }
    return null;
  }

  if (res.status === 204) return null;

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Builds an absolute URL for server-side fetches. */
async function toAbsoluteUrl(input: string): Promise<string> {
  if (!input.startsWith("/")) return input;

  // Browser: relative is fine
  if (typeof window !== "undefined") return input;

  // Prefer env
  if (process.env.NEXT_PUBLIC_SITE_URL)
    return `${process.env.NEXT_PUBLIC_SITE_URL}${input}`;

  // Server: derive from headers()
  const { headers } = await import("next/headers");
  const h = await headers(); // 👈 FIX: await here
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) throw new Error("fetcher: cannot determine host for server fetch");
  return `${proto}://${host}${input}`;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
