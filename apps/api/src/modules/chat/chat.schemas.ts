import { z } from 'zod';

export const documentIdParamsSchema = z.object({
  documentId: z.uuid(),
});

export const askQuestionBodySchema = z.object({
  conversationId: z.uuid().optional(),
  question: z.string().min(1).max(4000),
});
export type AskQuestionInput = z.infer<typeof askQuestionBodySchema>;

export const conversationIdParamsSchema = z.object({
  id: z.uuid(),
});
