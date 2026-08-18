import { and, asc, cosineDistance, eq, sql } from 'drizzle-orm';
import { db } from '../../infra/db/client.js';
import {
  conversations,
  messages,
  documentChunks,
  type MessageRole,
} from '../../infra/db/schema.js';

export async function findConversationById(id: string, userId: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));

  return conversation;
}

export async function insertConversation(userId: string, documentId: string) {
  const [conversation] = await db.insert(conversations).values({ userId, documentId }).returning();

  return conversation;
}

export async function findMessagesByConversationId(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

interface InsertMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
  tokenCount: number | null;
}

export async function insertMessage(input: InsertMessageInput) {
  const [message] = await db.insert(messages).values(input).returning();

  return message;
}

const TOP_K = 5;

export async function findRelevantChunks(documentId: string, queryEmbedding: number[]) {
  // cosineDistance = 1 - cosine similarity, so ordering ascending by distance
  // is the same as ordering descending by similarity — closest matches first.
  const distance = cosineDistance(documentChunks.embedding, queryEmbedding);

  return db
    .select({
      content: documentChunks.content,
      chunkIndex: documentChunks.chunkIndex,
      similarity: sql<number>`1 - (${distance})`,
    })
    .from(documentChunks)
    .where(eq(documentChunks.documentId, documentId))
    .orderBy(distance)
    .limit(TOP_K);
}
