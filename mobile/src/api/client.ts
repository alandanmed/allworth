import { firebaseAuth } from '@/firebase/config';

const API_BASE_URL = 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
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
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(path: string): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  const headers = await getAuthHeaders();
  const response = await fetch(url.toString(), { method: 'POST', headers });

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}
