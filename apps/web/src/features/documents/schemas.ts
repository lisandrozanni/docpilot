import { z } from 'zod';
import { MAX_UPLOAD_SIZE_BYTES } from '@docpilot/shared';

export const uploadFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === 'application/pdf', 'Only PDF files are supported')
    .refine((file) => file.size <= MAX_UPLOAD_SIZE_BYTES, 'File must be 10MB or smaller'),
});
export type UploadFormValues = z.infer<typeof uploadFormSchema>;
