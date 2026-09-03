import { env } from '../lib/env.js';
import * as real from './pdf.real.js';
import * as mock from './pdf.mock.js';

export type { ExtractedPage, ExtractedPdf } from './pdf.real.js';

const impl = env.MOCK_EXTERNAL_SERVICES ? mock : real;

export const extractPdfText = impl.extractPdfText;
