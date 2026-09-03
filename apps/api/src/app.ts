import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { AppError } from './lib/errors.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { documentsRoutes } from './modules/documents/documents.routes.js';
import { chatRoutes } from './modules/chat/chat.routes.js';
import { mockUploadRoutes } from './modules/mock-upload/mock-upload.routes.js';

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  if (env.MOCK_EXTERNAL_SERVICES) {
    // Only needed so the browser can PUT straight to /mock-uploads (a
    // stand-in for S3, a different origin in production) — real S3 handles
    // its own CORS via bucket config, not this server.
    void app.register(cors, { methods: ['PUT'] });
  }

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        issues: error.issues,
      });
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
    }

    // Only genuine Fastify-framework errors (malformed JSON body, oversized
    // payload, etc.) are safe to forward verbatim — they're marked with a
    // "FST_" coded `code`. A third-party SDK error (e.g. Voyage, S3) can also
    // happen to carry a `.statusCode` under 500, but its `.message` is that
    // service's internal error detail, not something meant for our clients.
    const fastifyError = error as FastifyError;
    if (fastifyError.statusCode !== undefined && fastifyError.code?.startsWith('FST_')) {
      return reply.code(fastifyError.statusCode).send({
        code: fastifyError.code,
        message: fastifyError.message,
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    });
  });

  app.register(healthRoutes);
  app.register(documentsRoutes);
  app.register(chatRoutes);

  if (env.MOCK_EXTERNAL_SERVICES) {
    app.register(mockUploadRoutes);
  }

  return app;
}
