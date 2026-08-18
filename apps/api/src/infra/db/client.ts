import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// A single pooled connection shared across the process — Fastify handles one
// request at a time per worker, so there is no need for a pool per-request.
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });
