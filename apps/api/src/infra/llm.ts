import { env } from '../lib/env.js';
import * as real from './llm.real.js';
import * as mock from './llm.mock.js';

export type { ChatMessage } from './llm.real.js';

const impl = env.MOCK_EXTERNAL_SERVICES ? mock : real;

export const streamAnswer = impl.streamAnswer;
