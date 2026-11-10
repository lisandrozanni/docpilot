import { describe, expect, it, vi } from 'vitest';
import { uploadResponseSchema } from '@docpilot/shared';

vi.mock('../../lib/logger.js', () => ({ logger: { error: vi.fn() } }));
vi.mock('../../infra/s3.js', () => ({
  buildS3Key: vi.fn((_userId: string, documentId: string) => `documents/${documentId}.pdf`),
  createPresignedUploadUrl: vi.fn().mockResolvedValue('https://s3.example.com/upload'),
  objectExists: vi.fn(),
}));
vi.mock('./documents.repository.js', () => ({
  insertDocument: vi.fn(async (document: { id: string }) => document),
}));
vi.mock('./documents.worker.js', () => ({ processDocument: vi.fn() }));

import { requestUpload } from './documents.service.js';

describe('requestUpload', () => {
  it('returns a response that the web upload flow can parse', async () => {
    const result = await requestUpload({
      userId: 'user-1',
      filename: 'report.pdf',
      sizeBytes: 1024,
      contentType: 'application/pdf',
    });

    expect(uploadResponseSchema.parse(result)).toEqual({
      documentId: expect.any(String),
      uploadUrl: 'https://s3.example.com/upload',
    });
  });
});
