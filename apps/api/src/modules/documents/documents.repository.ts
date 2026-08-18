import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../infra/db/client.js';
import { documents, type DocumentStatus } from '../../infra/db/schema.js';

interface InsertDocumentInput {
  id: string;
  userId: string;
  filename: string;
  s3Key: string;
  sizeBytes: number;
}

export async function insertDocument(input: InsertDocumentInput) {
  const [document] = await db.insert(documents).values(input).returning();

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

export async function updateDocumentStatus(id: string, userId: string, status: DocumentStatus) {
  const [updated] = await db
    .update(documents)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning();

  return updated;
}

export async function updateDocumentPageCount(id: string, pageCount: number) {
  const [updated] = await db
    .update(documents)
    .set({ pageCount, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();

  return updated;
}

export async function markDocumentFailed(id: string, userId: string, errorMessage: string) {
  const [updated] = await db
    .update(documents)
    .set({ status: 'failed', errorMessage, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning();

  return updated;
}

export async function deleteDocumentById(id: string, userId: string) {
  const [deleted] = await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning({ id: documents.id });

  return deleted;
}
