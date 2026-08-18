import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set — copy .env.example to .env first');
}

export default defineConfig({
  schema: './src/lib/db/auth-schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // apps/api has its own drizzle-kit setup against the same database — separate
  // migrations tracking tables so the two workspaces' journals never collide.
  migrations: {
    schema: 'drizzle_web',
  },
  verbose: true,
  strict: true,
});
