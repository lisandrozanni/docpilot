import { z } from 'zod';
import { documentStatus } from '../../infra/db/schema.js';

export const createDocumentBodySchema = z.object({
  filename: z.string().min(1).max(255),
  s3Key: z.string().min(1),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});
export type CreateDocumentInput = z.infer<typeof createDocumentBodySchema> & { userId: string };

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
