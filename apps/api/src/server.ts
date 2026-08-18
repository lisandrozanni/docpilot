import 'dotenv/config';
import { buildApp } from './app.js';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';

const app = buildApp();

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
} catch (error) {
  logger.error(error);
  process.exit(1);
}
