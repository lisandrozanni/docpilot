import { z } from 'zod';

// With MOCK_EXTERNAL_SERVICES=true, apps/api swaps every infra/*.ts client
// (S3, Anthropic, Voyage) for an in-process fake — see infra/*.mock.ts — so
// none of their credentials are needed to run the app locally.
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    MOCK_EXTERNAL_SERVICES: z.coerce.boolean().default(false),
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    VOYAGE_API_KEY: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.MOCK_EXTERNAL_SERVICES) {
      return;
    }

    const required = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'S3_BUCKET_NAME',
      'ANTHROPIC_API_KEY',
      'VOYAGE_API_KEY',
    ] as const;

    for (const key of required) {
      if (!value[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required unless MOCK_EXTERNAL_SERVICES=true`,
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment variables — check .env against .env.example');
}

export const env = parsed.data;
