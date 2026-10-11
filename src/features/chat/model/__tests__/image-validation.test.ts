import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, validateImageFile } from '../image-validation';

const file = (name: string, type: string, size = 1000) =>
  ({ name, type, size }) as File;

describe('validateImageFile', () => {
  it('accepts JPEG, PNG and WebP up to 5 MB', () => {
    expect(MAX_IMAGE_BYTES).toBe(5_242_880);
    expect(validateImageFile(file('a.jpg', 'image/jpeg'))).toBeNull();
    expect(validateImageFile(file('a.JPEG', 'image/jpeg'))).toBeNull();
    expect(validateImageFile(file('a.png', 'image/png'))).toBeNull();
    expect(
      validateImageFile(file('a.webp', 'image/webp', MAX_IMAGE_BYTES)),
    ).toBeNull();
  });

  it('rejects one byte over the limit', () => {
    expect(
      validateImageFile(file('a.png', 'image/png', MAX_IMAGE_BYTES + 1)),
    ).toBe('ATTACHMENT_TOO_LARGE');
  });

  it('rejects other types and mismatched extensions', () => {
    expect(validateImageFile(file('a.gif', 'image/gif'))).toBe(
      'ATTACHMENT_TYPE_NOT_ALLOWED',
    );
    expect(validateImageFile(file('a.pdf', 'application/pdf'))).toBe(
      'ATTACHMENT_TYPE_NOT_ALLOWED',
    );
    expect(validateImageFile(file('a.exe', 'image/png'))).toBe(
      'ATTACHMENT_TYPE_NOT_ALLOWED',
    );
    expect(validateImageFile(file('noext', 'image/png'))).toBe(
      'ATTACHMENT_TYPE_NOT_ALLOWED',
    );
  });

  it('reports the type before the size', () => {
    expect(
      validateImageFile(file('a.gif', 'image/gif', MAX_IMAGE_BYTES + 1)),
    ).toBe('ATTACHMENT_TYPE_NOT_ALLOWED');
  });
});
