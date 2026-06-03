const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "beauty_admin_token";

export const adminTokenStore = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => { if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t); },
  clear: () => { if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY); },
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = adminTokenStore.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText);
  return data as T;
}

export const adminFetcher = <T>(url: string): Promise<T> => request<T>(url);
