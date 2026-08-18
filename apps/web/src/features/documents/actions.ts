'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { uploadRequestSchema, uploadResponseSchema, type UploadRequest } from '@docpilot/shared';
import { requireSession } from '@/features/auth/lib/session';
import { apiFetch } from '@/lib/api-client';

export async function requestUpload(input: UploadRequest) {
  // Server Actions are public HTTP endpoints — session and input are re-validated
  // here regardless of any client-side (RHF/Zod) validation already done.
  await requireSession();
  const body = uploadRequestSchema.parse(input);

  const response = await apiFetch('/documents/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to request upload URL (${response.status})`);
  }

  const json: unknown = await response.json();
  return uploadResponseSchema.parse(json);
}

export async function confirmUpload(documentId: string) {
  await requireSession();

  const response = await apiFetch(`/documents/${documentId}/confirm`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(`Failed to confirm upload (${response.status})`);
  }

  revalidatePath('/documents');
}

export async function deleteDocument(documentId: string) {
  // Authentication (requireSession) and authorization (apps/api scoping the
  // delete to the JWT's own userId, returning 404 for another user's document)
  // are two separate checks — both are required, neither substitutes the other.
  await requireSession();
  const id = z.uuid().parse(documentId);

  const response = await apiFetch(`/documents/${id}`, { method: 'DELETE' });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete document (${response.status})`);
  }

  revalidatePath('/documents');
}
