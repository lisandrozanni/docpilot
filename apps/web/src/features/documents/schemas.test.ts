import { describe, expect, it } from 'vitest';
import { uploadFormSchema } from './schemas';

function fileOf(name: string, type: string, sizeBytes: number) {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

describe('uploadFormSchema', () => {
  it('accepts a valid PDF within the size limit', () => {
    const result = uploadFormSchema.safeParse({
      file: fileOf('report.pdf', 'application/pdf', 1024),
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-PDF content type', () => {
    const result = uploadFormSchema.safeParse({
      file: fileOf('notes.txt', 'text/plain', 1024),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Only PDF files are supported');
    }
  });

  it('rejects a file over the 10MB limit', () => {
    const result = uploadFormSchema.safeParse({
      file: fileOf('big.pdf', 'application/pdf', 11 * 1024 * 1024),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('File must be 10MB or smaller');
    }
  });
});
