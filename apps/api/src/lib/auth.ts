import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from './env.js';

// Cached across requests — createRemoteJWKSet handles its own key refresh and
// caching, so this must not be re-created per request.
const jwks = createRemoteJWKSet(new URL(env.AUTH_JWKS_URL));

export async function verifyAuthToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, jwks);

  if (typeof payload.sub !== 'string') {
    throw new Error('JWT is missing a subject claim');
  }

  return payload.sub;
}
