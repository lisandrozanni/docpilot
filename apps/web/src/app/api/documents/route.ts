import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api-client';

// Thin proxy so the browser (TanStack Query polling) can reach apps/api.
export async function GET() {
  const response = await apiFetch('/documents');
  const body: unknown = await response.json();

  return NextResponse.json(body, { status: response.status });
}
