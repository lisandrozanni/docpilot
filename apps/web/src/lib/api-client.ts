import { headers } from 'next/headers';
import { auth } from './auth/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// Server-only: exchanges the caller's Better Auth session for a short-lived JWT,
// then calls apps/api with it as a bearer token. Never call from a Client Component.
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const requestHeaders = await headers();
  const { headers: authHeaders } = await auth.api.getSession({
    headers: requestHeaders,
    returnHeaders: true,
  });

  const token = authHeaders.get('set-auth-jwt');

  if (!token) {
    throw new Error('No active session — cannot call the API');
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
