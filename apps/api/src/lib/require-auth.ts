import type { FastifyRequest } from 'fastify';
import { verifyAuthToken } from './auth.js';
import { UnauthorizedError } from './errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

export async function requireAuth(request: FastifyRequest): Promise<void> {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token');
  }

  const token = header.slice('Bearer '.length);

  try {
    request.userId = await verifyAuthToken(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// Safe to call only in a handler behind the requireAuth preHandler, which throws
// before the handler runs if no valid token was present.
export function getUserId(request: FastifyRequest): string {
  if (!request.userId) {
    throw new UnauthorizedError('Missing bearer token');
  }

  return request.userId;
}
