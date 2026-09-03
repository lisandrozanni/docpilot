import { env } from '../lib/env.js';

// In-memory stand-in for S3, used when MOCK_EXTERNAL_SERVICES=true. The
// "presigned URL" points at this process's own /mock-uploads/:key route (see
// modules/mock-upload/), which calls putObject() below on PUT — same
// upload-then-confirm flow as real S3, no AWS credentials involved.
//
// The browser (not this server) performs the PUT, so the URL must be
// absolute — a relative path would resolve against apps/web's own origin
// instead of apps/api's.
const store = new Map<string, Buffer>();

export function buildS3Key(userId: string, documentId: string): string {
  return `users/${userId}/${documentId}.pdf`;
}

export function createPresignedUploadUrl(s3Key: string, _contentType: string): Promise<string> {
  return Promise.resolve(`http://localhost:${env.PORT}/mock-uploads/${encodeURIComponent(s3Key)}`);
}

export function putObject(s3Key: string, body: Buffer): void {
  store.set(s3Key, body);
}

export function downloadObject(s3Key: string): Promise<Buffer> {
  const body = store.get(s3Key);

  if (!body) {
    throw new Error(`Mock S3 object ${s3Key} has no body`);
  }

  return Promise.resolve(body);
}

export function objectExists(s3Key: string): Promise<boolean> {
  return Promise.resolve(store.has(s3Key));
}
