import type { FastifyInstance } from 'fastify';
import * as documentsService from './documents.service.js';
import { createDocumentBodySchema, documentIdParamsSchema } from './documents.schemas.js';
import { requireAuth, getUserId } from '../../lib/require-auth.js';

export async function documentsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.post('/documents', async (request, reply) => {
    const body = createDocumentBodySchema.parse(request.body);
    const document = await documentsService.createDocument({
      ...body,
      userId: getUserId(request),
    });
    return reply.code(201).send(document);
  });

  app.get('/documents', async (request) => {
    return documentsService.listDocuments(getUserId(request));
  });

  app.get('/documents/:id', async (request) => {
    const params = documentIdParamsSchema.parse(request.params);
    return documentsService.getDocument(params.id, getUserId(request));
  });

  app.delete('/documents/:id', async (request, reply) => {
    const params = documentIdParamsSchema.parse(request.params);
    await documentsService.deleteDocument(params.id, getUserId(request));
    return reply.code(204).send();
  });
}
