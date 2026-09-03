import type { FastifyInstance } from 'fastify';
import { putObject } from '../../infra/s3.mock.js';

// Stand-in for S3 itself, registered only when MOCK_EXTERNAL_SERVICES=true.
// The mocked createPresignedUploadUrl() (infra/s3.mock.ts) points the browser
// here instead of at AWS — same "PUT the file bytes, then confirm" flow the
// real S3 upload uses, just served by this process.
export async function mockUploadRoutes(app: FastifyInstance) {
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (_request, body, done) => {
    done(null, body);
  });

  app.put<{ Params: { key: string } }>('/mock-uploads/:key', async (request, reply) => {
    const s3Key = decodeURIComponent(request.params.key);
    putObject(s3Key, request.body as Buffer);
    return reply.code(200).send();
  });
}
