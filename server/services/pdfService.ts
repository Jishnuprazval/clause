import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  info?: any;
}

/**
 * Extracts raw and formatted text from uploaded PDF buffer
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ExtractedPdfResult> {
  try {
    const data = await pdfParse(buffer);
    const cleanedText = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return {
      text: cleanedText || 'Empty document content.',
      pageCount: data.numpages || 1,
      info: data.info,
    };
  } catch (error) {
    console.error('[ClauseRadar PDF] Error parsing PDF buffer:', error);
    throw new Error('Failed to parse and extract text from the uploaded PDF document. Please verify the file is not encrypted or corrupted.');
  }
}
