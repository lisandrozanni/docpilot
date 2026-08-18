import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../infra/db/client.js';
import { documents } from '../../infra/db/schema.js';
import type { CreateDocumentInput } from './documents.schemas.js';

export async function insertDocument(input: CreateDocumentInput) {
  const [document] = await db
    .insert(documents)
    .values({
      userId: input.userId,
      filename: input.filename,
      s3Key: input.s3Key,
      sizeBytes: input.sizeBytes,
    })
    .returning();

  return document;
}

export async function findDocumentsByUserId(userId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

export async function findDocumentById(id: string, userId: string) {
  const [document] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));

  return document;
}

export async function deleteDocumentById(id: string, userId: string) {
  const [deleted] = await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning({ id: documents.id });

  return deleted;
}
