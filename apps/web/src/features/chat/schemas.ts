import { z } from 'zod';

export const askQuestionFormSchema = z.object({
  question: z.string().min(1, 'Type a question').max(4000),
});
export type AskQuestionFormValues = z.infer<typeof askQuestionFormSchema>;
