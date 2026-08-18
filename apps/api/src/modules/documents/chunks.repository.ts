import { eq } from 'drizzle-orm';
import { db } from '../../infra/db/client.js';
import { documentChunks } from '../../infra/db/schema.js';
import type { Chunk } from '../../infra/chunking.js';

interface ChunkWithPage extends Chunk {
  pageNumber: number | null;
  embedding: number[];
}

export async function replaceChunksForDocument(
  documentId: string,
  chunks: ChunkWithPage[],
): Promise<void> {
  // Reprocessing must be idempotent: delete any chunks from a previous attempt
  // before inserting the new set, in the same transaction, so a crash between
  // the two steps can't leave a document with a partial/duplicate chunk set.
  await db.transaction(async (tx) => {
    await tx.delete(documentChunks).where(eq(documentChunks.documentId, documentId));

    if (chunks.length === 0) {
      return;
    }

    await tx.insert(documentChunks).values(
      chunks.map((chunk) => ({
        documentId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        embedding: chunk.embedding,
      })),
    );
  });
}
