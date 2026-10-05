import { describe, expect, it } from 'vitest';
import { integerError, keyError, sortError } from '../model/form';

describe('catalog form checks', () => {
  it('reserves the key "new"', () => {
    expect(keyError('new')).toBe('catalog.keyReserved');
    expect(keyError('newer')).toBeNull();
  });
  it('bounds sort order and token limits', () => {
    expect(sortError('1000')).toBeNull();
    expect(sortError('1001')).not.toBeNull();
    expect(integerError('256', 256)).toBeNull();
    expect(integerError('257', 256)).not.toBeNull();
    expect(integerError('10000001')).not.toBeNull();
  });
});
