import { z } from 'zod';
import { uploadRequestSchema } from '@docpilot/shared';
import { documentStatus } from '../../infra/db/schema.js';

export const requestUploadBodySchema = uploadRequestSchema;
export type RequestUploadInput = z.infer<typeof requestUploadBodySchema> & { userId: string };

export const documentIdParamsSchema = z.object({
  id: z.uuid(),
});

export const documentResponseSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  filename: z.string(),
  s3Key: z.string(),
  sizeBytes: z.number(),
  pageCount: z.number().nullable(),
  status: z.enum(documentStatus),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type DocumentResponse = z.infer<typeof documentResponseSchema>;
