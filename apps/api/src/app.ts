import Fastify, { type FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { logger } from './lib/logger.js';
import { AppError } from './lib/errors.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { documentsRoutes } from './modules/documents/documents.routes.js';

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

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

    const fastifyError = error as FastifyError;
    if (fastifyError.statusCode !== undefined && fastifyError.statusCode < 500) {
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

  return app;
}
