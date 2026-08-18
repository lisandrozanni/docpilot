import { describe, expect, it } from 'vitest';
import { MAX_UPLOAD_SIZE_BYTES, uploadRequestSchema } from './document.js';

function validInput(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    filename: 'document.pdf',
    sizeBytes: 1024,
    contentType: 'application/pdf',
    ...overrides,
  };
}

describe('uploadRequestSchema', () => {
  it('accepts a valid upload request', () => {
    const result = uploadRequestSchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  it('rejects a file exactly at the size limit plus one byte', () => {
    const result = uploadRequestSchema.safeParse(
      validInput({ sizeBytes: MAX_UPLOAD_SIZE_BYTES + 1 }),
    );
    expect(result.success).toBe(false);
  });

  it('accepts a file exactly at the size limit', () => {
    const result = uploadRequestSchema.safeParse(validInput({ sizeBytes: MAX_UPLOAD_SIZE_BYTES }));
    expect(result.success).toBe(true);
  });

  it('rejects a non-positive size', () => {
    expect(uploadRequestSchema.safeParse(validInput({ sizeBytes: 0 })).success).toBe(false);
    expect(uploadRequestSchema.safeParse(validInput({ sizeBytes: -1 })).success).toBe(false);
  });

  it('rejects a non-integer size', () => {
    const result = uploadRequestSchema.safeParse(validInput({ sizeBytes: 1024.5 }));
    expect(result.success).toBe(false);
  });

  it('rejects an empty filename', () => {
    const result = uploadRequestSchema.safeParse(validInput({ filename: '' }));
    expect(result.success).toBe(false);
  });

  it('rejects a filename over 255 characters', () => {
    const result = uploadRequestSchema.safeParse(validInput({ filename: 'a'.repeat(256) }));
    expect(result.success).toBe(false);
  });

  it('rejects any content type other than application/pdf', () => {
    const result = uploadRequestSchema.safeParse(validInput({ contentType: 'image/png' }));
    expect(result.success).toBe(false);
  });

  it('rejects a request missing required fields', () => {
    const result = uploadRequestSchema.safeParse({ filename: 'document.pdf' });
    expect(result.success).toBe(false);
  });
});
