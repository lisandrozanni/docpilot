import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../../lib/require-auth.js';
import { logger } from '../../lib/logger.js';
import * as chatService from './chat.service.js';
import {
  askQuestionBodySchema,
  documentIdParamsSchema,
  conversationIdParamsSchema,
} from './chat.schemas.js';

export async function chatRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.post('/documents/:documentId/chat', async (request, reply) => {
    const params = documentIdParamsSchema.parse(request.params);
    const body = askQuestionBodySchema.parse(request.body);
    const userId = getUserId(request);

    const { conversationId, textStream, onComplete } = await chatService.askQuestion({
      documentId: params.documentId,
      userId,
      conversationId: body.conversationId,
      question: body.question,
    });

    let fullAnswer = '';
    let headersSent = false;

    try {
      for await (const delta of textStream) {
        if (!headersSent) {
          // Headers are deferred until the first delta arrives, so a failure
          // before any text is produced (e.g. an upstream auth error) can
          // still surface as a real HTTP error status instead of a misleading
          // 200 with an empty body.
          reply.raw.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Conversation-Id': conversationId,
            'Cache-Control': 'no-cache',
          });
          headersSent = true;
        }

        fullAnswer += delta;
        reply.raw.write(delta);
      }
    } catch (error) {
      logger.error({ error, conversationId }, 'chat stream failed');

      if (!headersSent) {
        return reply.code(502).send({
          code: 'UPSTREAM_ERROR',
          message: 'Failed to get an answer from the model',
        });
      }
      // Headers (and a 200) are already on the wire — the client received
      // partial text with no way to signal an in-band error over a plain text
      // stream, so closing the connection is the only failure signal left.
      // The partial answer is still persisted below so the conversation
      // history isn't silently missing the assistant's (incomplete) turn.
    } finally {
      if (headersSent) {
        reply.raw.end();
      }

      if (fullAnswer.length > 0) {
        await onComplete(fullAnswer);
      }
    }

    return reply;
  });

  app.get('/conversations/:id/messages', async (request) => {
    const params = conversationIdParamsSchema.parse(request.params);
    return chatService.getConversationMessages(params.id, getUserId(request));
  });
}
