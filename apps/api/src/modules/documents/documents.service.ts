import { randomUUID } from 'node:crypto';
import { logger } from '../../lib/logger.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { buildS3Key, createPresignedUploadUrl, objectExists } from '../../infra/s3.js';
import * as documentsRepository from './documents.repository.js';
import { processDocument } from './documents.worker.js';
import type { RequestUploadInput } from './documents.schemas.js';

export async function requestUpload(input: RequestUploadInput) {
  // The document id is generated here (not left to the DB default) so the S3 key
  // can be derived from it before the row exists — s3Key is never client-supplied,
  // which would otherwise let a client point an upload at an arbitrary key.
  const id = randomUUID();
  const s3Key = buildS3Key(input.userId, id);

  await documentsRepository.insertDocument({
    id,
    userId: input.userId,
    filename: input.filename,
    s3Key,
    sizeBytes: input.sizeBytes,
  });

  const uploadUrl = await createPresignedUploadUrl(s3Key, input.contentType);

  return { documentId: id, uploadUrl };
}

export async function confirmUpload(id: string, userId: string) {
  const document = await documentsRepository.findDocumentById(id, userId);

  if (!document) {
    throw new NotFoundError(`Document ${id} not found`);
  }

  if (document.status !== 'pending') {
    throw new ConflictError(`Document ${id} is not pending upload`);
  }

  const exists = await objectExists(document.s3Key);

  if (!exists) {
    throw new ConflictError('Upload not found in S3 — the PUT may not have completed');
  }

  const updated = await documentsRepository.updateDocumentStatus(id, userId, 'processing');

  // Deliberately not awaited: the HTTP response confirms the upload was
  // accepted, not that processing finished. The client learns the outcome by
  // polling document.status (ready/failed) — see Etapa 6.
  processDocument(id, userId).catch((error: unknown) => {
    logger.error({ documentId: id, error }, 'processDocument threw outside its own try/catch');
  });

  return updated;
}

export async function listDocuments(userId: string) {
  return documentsRepository.findDocumentsByUserId(userId);
}

export async function getDocument(id: string, userId: string) {
  const document = await documentsRepository.findDocumentById(id, userId);

  if (!document) {
    throw new NotFoundError(`Document ${id} not found`);
  }

  return document;
}

export async function deleteDocument(id: string, userId: string) {
  const deleted = await documentsRepository.deleteDocumentById(id, userId);

  if (!deleted) {
    throw new NotFoundError(`Document ${id} not found`);
  }

  return deleted;
}
