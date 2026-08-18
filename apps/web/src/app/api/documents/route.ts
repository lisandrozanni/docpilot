import { NextResponse } from 'next/server';
import { requireSession } from '@/features/auth/lib/session';
import { apiFetch } from '@/lib/api-client';

// Thin proxy so the browser (TanStack Query polling) can reach apps/api without
// ever holding the JWT itself — apiFetch mints it server-side per request.
export async function GET() {
  await requireSession();

  const response = await apiFetch('/documents');
  const body: unknown = await response.json();

  return NextResponse.json(body, { status: response.status });
}
