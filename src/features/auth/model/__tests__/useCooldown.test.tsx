import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCooldown } from '../useCooldown';

describe('useCooldown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('is idle until started', () => {
    const { result } = renderHook(() => useCooldown(60));
    expect(result.current.active).toBe(false);
    expect(result.current.remaining).toBe(0);
  });

  it('counts down once a second and ends at zero', () => {
    const { result } = renderHook(() => useCooldown(3));
    act(() => result.current.start());
    expect(result.current.remaining).toBe(3);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remaining).toBe(2);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.remaining).toBe(0);
    expect(result.current.active).toBe(false);
  });

  it('can start active and restart', () => {
    const { result } = renderHook(() => useCooldown(5, true));
    expect(result.current.remaining).toBe(5);
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.remaining).toBe(2);
    act(() => result.current.start());
    expect(result.current.remaining).toBe(5);
  });
});
