import { logger } from '../../lib/logger.js';
import { downloadObject } from '../../infra/s3.js';
import { extractPdfText } from '../../infra/pdf.js';
import { chunkText } from '../../infra/chunking.js';
import { embedDocumentChunks } from '../../infra/embeddings.js';
import { replaceChunksForDocument } from './chunks.repository.js';
import * as documentsRepository from './documents.repository.js';

// In-process worker: sufficient for this project's scope (see Etapa 11 for when
// a real queue like BullMQ+Redis would become necessary — multiple API
// instances, retry/backoff policies, or processing surviving a server restart).
// "Fire and forget" from the caller's perspective — confirmUpload does not
// await this; the client learns the outcome via polling document.status.
export async function processDocument(documentId: string, userId: string): Promise<void> {
  try {
    const document = await documentsRepository.findDocumentById(documentId, userId);

    if (!document) {
      logger.error({ documentId }, 'processDocument: document not found');
      return;
    }

    const fileBuffer = await downloadObject(document.s3Key);
    const extracted = await extractPdfText(fileBuffer);

    const chunks = extracted.pages.flatMap((page) =>
      chunkText(page.text).map((chunk) => ({ ...chunk, pageNumber: page.pageNumber })),
    );

    // chunkIndex must be unique per document (see the DB constraint), not just
    // per page — reindex sequentially across the whole document.
    const reindexed = chunks.map((chunk, index) => ({ ...chunk, chunkIndex: index }));

    // One batched call for all of a document's chunks rather than one call per
    // chunk — Voyage accepts up to 128 inputs per request, and batching avoids
    // paying per-request latency/rate-limit overhead once per chunk.
    const embeddings = await embedDocumentChunks(reindexed.map((chunk) => chunk.content));

    if (embeddings.length !== reindexed.length) {
      throw new Error(`Expected ${reindexed.length} embeddings, got ${embeddings.length}`);
    }

    const withEmbeddings = reindexed.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index] ?? [],
    }));

    await replaceChunksForDocument(documentId, withEmbeddings);
    await documentsRepository.updateDocumentPageCount(documentId, extracted.pageCount);
    await documentsRepository.updateDocumentStatus(documentId, userId, 'ready');
  } catch (error) {
    logger.error({ documentId, error }, 'processDocument failed');

    const message = error instanceof Error ? error.message : 'Unknown processing error';
    await documentsRepository.markDocumentFailed(documentId, userId, message);
  }
}
