import type { FastifyRequest } from 'fastify';

// The app has no login — every request acts as this single fixed user.
const DEFAULT_USER_ID = 'default-user';

export function getUserId(_request: FastifyRequest): string {
  return DEFAULT_USER_ID;
}
