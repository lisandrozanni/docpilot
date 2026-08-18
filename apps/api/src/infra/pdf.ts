import { PDFParse } from 'pdf-parse';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedPdf {
  pageCount: number;
  pages: ExtractedPage[];
}

export async function extractPdfText(buffer: Buffer): Promise<ExtractedPdf> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();

    return {
      pageCount: result.total,
      pages: result.pages.map((page) => ({ pageNumber: page.num, text: page.text })),
    };
  } finally {
    await parser.destroy();
  }
}
