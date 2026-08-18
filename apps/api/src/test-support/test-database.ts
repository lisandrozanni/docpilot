import { PostgreSqlContainer } from '@testcontainers/postgresql';
import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../infra/db/schema.js';

export interface TestDatabase {
  db: PostgresJsDatabase<typeof schema>;
  connectionString: string;
  stop: () => Promise<void>;
}

// Boots a real, ephemeral Postgres (same pgvector-enabled image as dev/prod —
// see docker-compose.yml) per test run, applies this workspace's own
// migrations, then hand-creates the "user" table apps/web's Better Auth
// migration would normally own — the FK from documents.user_id needs it to
// exist, but this workspace never migrates a table it doesn't own (see the
// comment on authUserMirror in infra/db/schema.ts).
export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('pgvector/pgvector:pg17').start();
  const connectionString = container.getConnectionUri();

  const queryClient = postgres(connectionString);
  await queryClient`CREATE EXTENSION IF NOT EXISTS vector`;
  await queryClient`CREATE TABLE "user" (id text PRIMARY KEY)`;

  const db = drizzle(queryClient, { schema });
  await migrate(db, {
    migrationsFolder: new URL('../infra/db/migrations', import.meta.url).pathname,
  });

  return {
    db,
    connectionString,
    stop: async () => {
      await queryClient.end();
      await container.stop();
    },
  };
}
