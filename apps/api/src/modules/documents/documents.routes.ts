import type { FastifyInstance } from 'fastify';
import * as documentsService from './documents.service.js';
import { requestUploadBodySchema, documentIdParamsSchema } from './documents.schemas.js';
import { getUserId } from '../../lib/require-auth.js';

export async function documentsRoutes(app: FastifyInstance) {
  app.post('/documents/upload-url', async (request, reply) => {
    const body = requestUploadBodySchema.parse(request.body);
    const result = await documentsService.requestUpload({ ...body, userId: getUserId(request) });
    return reply.code(201).send(result);
  });

  app.post('/documents/:id/confirm', async (request) => {
    const params = documentIdParamsSchema.parse(request.params);
    return documentsService.confirmUpload(params.id, getUserId(request));
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
