import type { FastifyInstance } from 'fastify';
import * as documentsService from './documents.service.js';
import {
  createDocumentSchema,
  documentIdParamsSchema,
  listDocumentsQuerySchema,
} from './documents.schemas.js';

export async function documentsRoutes(app: FastifyInstance) {
  app.post('/documents', async (request, reply) => {
    const body = createDocumentSchema.parse(request.body);
    const document = await documentsService.createDocument(body);
    return reply.code(201).send(document);
  });

  app.get('/documents', async (request) => {
    const query = listDocumentsQuerySchema.parse(request.query);
    return documentsService.listDocuments(query.userId);
  });

  app.get('/documents/:id', async (request) => {
    const params = documentIdParamsSchema.parse(request.params);
    const query = listDocumentsQuerySchema.parse(request.query);
    return documentsService.getDocument(params.id, query.userId);
  });

  app.delete('/documents/:id', async (request, reply) => {
    const params = documentIdParamsSchema.parse(request.params);
    const query = listDocumentsQuerySchema.parse(request.query);
    await documentsService.deleteDocument(params.id, query.userId);
    return reply.code(204).send();
  });
}
