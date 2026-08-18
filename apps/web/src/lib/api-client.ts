import { headers } from 'next/headers';
import { auth } from './auth/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// Server-only: exchanges the caller's Better Auth session for a short-lived JWT,
// then calls apps/api with it as a bearer token. Never call from a Client Component.
//
// Note: on an unauthenticated direct visit to a protected route, this can
// throw here even though (app)/layout.tsx's requireSession() already issued a
// redirect to /login — the App Router may render a layout and its child page
// concurrently during the initial RSC pass, so the page's own render can start
// (and this can throw) before the layout's redirect takes effect. The redirect
// still wins and the user only ever sees /login; this only produces a stray
// server-side log line, not a user-visible bug.
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
