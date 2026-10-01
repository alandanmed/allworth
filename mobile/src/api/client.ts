import { firebaseAuth } from '@/firebase/config';

// Overridable so the app can point at the deployed backend (e.g. for
// screenshots or a demo) without editing source: run with
// `EXPO_PUBLIC_API_BASE_URL=https://your-api.onrender.com npx expo start`.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function throwApiError(path: string, response: Response): Promise<never> {
  let message = `Request to ${path} failed with status ${response.status}`;
  try {
    const body = await response.json();
    if (body && typeof body.detail === 'string' && body.detail.trim()) {
      message = body.detail;
    }
  } catch {
    // Response body wasn't JSON (or was empty) — keep the generic message.
  }
  throw new ApiError(response.status, message);
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return {};
  const token = await currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const headers = await getAuthHeaders();
  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    await throwApiError(path, response);
  }
  return response.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  const authHeaders = await getAuthHeaders();
  const headers: HeadersInit = { ...authHeaders, 'Content-Type': 'application/json' };

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    await throwApiError(path, response);
  }
  return response.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  const authHeaders = await getAuthHeaders();
  const headers: HeadersInit = { ...authHeaders, 'Content-Type': 'application/json' };

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await throwApiError(path, response);
  }
  return response.json();
}

export async function apiDelete(path: string): Promise<void> {
  const url = new URL(path, API_BASE_URL);
  const headers = await getAuthHeaders();
  const response = await fetch(url.toString(), { method: 'DELETE', headers });

  if (!response.ok) {
    await throwApiError(path, response);
  }
}
