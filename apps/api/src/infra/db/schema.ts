import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Mirrors Better Auth's "user" table (owned and migrated by apps/web) so Drizzle
// can build the FK below. apps/api never migrates this table — it's a read-only
// reference to a table that lives in the same Postgres database but a different
// workspace's schema. Identity itself (who a JWT's subject claim refers to) is
// verified against Better Auth's JWKS endpoint, not by querying this table.
export const authUserMirror = pgTable('user', {
  id: text('id').primaryKey(),
});

export const documentStatus = ['pending', 'processing', 'ready', 'failed'] as const;
export type DocumentStatus = (typeof documentStatus)[number];

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => authUserMirror.id, { onDelete: 'cascade' }),
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
