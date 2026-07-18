// iOS Simulator shares the Mac's network, so 127.0.0.1 reaches the backend directly.
// A physical device would need the Mac's LAN IP instead (e.g. 192.168.x.x) — not this URL.
const API_BASE_URL = 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
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

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}
