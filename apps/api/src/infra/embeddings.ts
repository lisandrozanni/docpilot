import { env } from '../lib/env.js';
import * as real from './embeddings.real.js';
import * as mock from './embeddings.mock.js';

const impl = env.MOCK_EXTERNAL_SERVICES ? mock : real;

export const embedDocumentChunks = impl.embedDocumentChunks;
export const embedQuery = impl.embedQuery;
