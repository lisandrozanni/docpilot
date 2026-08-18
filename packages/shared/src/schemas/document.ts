import { z } from 'zod';

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
  contentType: z.literal('application/pdf'),
});
export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export const uploadResponseSchema = z.object({
  documentId: z.uuid(),
  uploadUrl: z.url(),
});
export type UploadResponse = z.infer<typeof uploadResponseSchema>;

export const confirmUploadRequestSchema = z.object({
  documentId: z.uuid(),
});
export type ConfirmUploadRequest = z.infer<typeof confirmUploadRequestSchema>;
