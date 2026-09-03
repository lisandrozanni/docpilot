const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// Server-only: proxies requests to apps/api. Never call from a Client Component.
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, init);
}
