import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOnline } from '../useOnline';

afterEach(() => vi.restoreAllMocks());

describe('useOnline', () => {
  it('follows online/offline events', () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);
    spy.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
    spy.mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('renders online on the server without touching navigator', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    function Probe() {
      return <span>{String(useOnline())}</span>;
    }
    expect(renderToString(<Probe />)).toContain('true');
  });
});
