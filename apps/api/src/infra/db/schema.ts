import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

// voyage-3.5 (Voyage AI) — Anthropic has no first-party embeddings API, and
// Voyage is the provider they recommend in their own docs.
export const EMBEDDING_DIMENSIONS = 1024;

export const documentStatus = ['pending', 'processing', 'ready', 'failed'] as const;
export type DocumentStatus = (typeof documentStatus)[number];

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // No FK: there is no login, so userId is not backed by a users table —
    // see apps/api/src/lib/require-auth.ts, which always returns the same
    // fixed id.
    userId: text('user_id').notNull(),
    filename: text('filename').notNull(),
    s3Key: text('s3_key').notNull().unique(),
    sizeBytes: integer('size_bytes').notNull(),
    pageCount: integer('page_count'),
    status: text('status', { enum: documentStatus }).notNull().default('pending'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('documents_user_id_created_at_idx').on(table.userId, table.createdAt.desc())],
);

export const documentChunks = pgTable(
  'document_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    pageNumber: integer('page_number'),
    // Nullable: populated by the worker right after the chunk is inserted, in
    // a separate step (embedding calls are a network round-trip, batched
    // across all of a document's chunks — see infra/embeddings.ts).
    embedding: vector('embedding', { dimensions: EMBEDDING_DIMENSIONS }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('document_chunks_document_id_idx').on(table.documentId),
    // Reprocessing a document must not silently duplicate its chunks — this
    // constraint is what makes the delete-then-reinsert idempotency in the
    // worker enforced at the database level, not just by convention.
    uniqueIndex('document_chunks_document_id_chunk_index_uidx').on(
      table.documentId,
      table.chunkIndex,
    ),
    // HNSW: approximate nearest-neighbor search. Trade-off is recall vs speed —
    // with the small chunk counts this project's test PDFs produce, a sequential
    // scan would be just as fast; the index earns its cost once chunk counts
    // grow into the thousands+.
    index('document_chunks_embedding_hnsw_idx').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  ],
);

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    title: text('title'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('conversations_user_id_created_at_idx').on(table.userId, table.createdAt.desc()),
  ],
);

export const messageRole = ['user', 'assistant'] as const;
export type MessageRole = (typeof messageRole)[number];

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: text('role', { enum: messageRole }).notNull(),
    content: text('content').notNull(),
    tokenCount: integer('token_count'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // ASC (not DESC like the other created_at indexes): messages render in
    // chronological order, oldest first — this index serves that scan directly.
    index('messages_conversation_id_created_at_idx').on(
      table.conversationId,
      table.createdAt.asc(),
    ),
  ],
);
