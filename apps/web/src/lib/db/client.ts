import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './auth-schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Separate pooled connection from apps/api — each service owns its own pool
// against the same Postgres instance, and each owns a different slice of the schema.
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });
