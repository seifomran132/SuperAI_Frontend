import { describe, expect, it } from 'vitest';
import { initialsOf } from '../AccountMenu';

describe('initialsOf', () => {
  it('uses the first letter of the first and last words', () => {
    expect(initialsOf('سارة اختبار')).toBe('سا');
    expect(initialsOf('محمد بن علي الأحمد')).toBe('ما');
  });
  it('one word gives one letter', () => {
    expect(initialsOf('سارة')).toBe('س');
  });
  it('falls back to the email, then a placeholder', () => {
    expect(initialsOf(null, 'user@test.local')).toBe('u');
    expect(initialsOf(null, null)).toBe('?');
  });
});
