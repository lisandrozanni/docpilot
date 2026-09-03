import type { ExtractedPdf } from './pdf.real.js';
import { extractPdfText as extractPdfTextReal } from './pdf.real.js';

const FALLBACK_PAGE_COUNT = 3;

// Tries the real parser first — a mocked LLM/embeddings doesn't mean the
// uploaded file isn't a real, parsable PDF. Only falls back to placeholder
// text if parsing fails, so the demo still works with a non-PDF or corrupt
// upload instead of erroring the whole processing pipeline.
export async function extractPdfText(buffer: Buffer): Promise<ExtractedPdf> {
  try {
    return await extractPdfTextReal(buffer);
  } catch {
    return {
      pageCount: FALLBACK_PAGE_COUNT,
      pages: Array.from({ length: FALLBACK_PAGE_COUNT }, (_, index) => ({
        pageNumber: index + 1,
        text:
          `[Mocked page ${index + 1} content] MOCK_EXTERNAL_SERVICES is enabled and the ` +
          `uploaded file could not be parsed as a real PDF, so this placeholder text stands in ` +
          `for it — enough for the chunking/embedding/chat pipeline to run end to end.`,
      })),
    };
  }
}
