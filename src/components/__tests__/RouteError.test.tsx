import { act, render, screen } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import { OfflineBanner } from '../OfflineBanner';
import { RouteError } from '../RouteError';

async function show(ui: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
    await router.load();
  });
}

beforeEach(() => {
  sessionStorage.clear();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe('RouteError', () => {
  it('keeps API errors as a recoverable alert', async () => {
    await show(
      <RouteError
        error={{ code: 'INTERNAL_ERROR', statusCode: 500, message: 'secret' }}
      />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: ar.common.retry })).toBeVisible();
  });

  it('keeps network errors as a recoverable alert', async () => {
    await show(<RouteError error={new TypeError('Failed to fetch')} />);
    expect(screen.getByText(ar.common.networkError)).toBeVisible();
  });

  it('shows the full-page screen for unexpected errors without details', async () => {
    await show(<RouteError error={new Error('secret stack detail')} />);
    expect(
      screen.getByRole('heading', { name: ar.common.crash.title }),
    ).toBeVisible();
    expect(screen.queryByText(/secret stack detail/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ar.common.reload }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: ar.common.goToChat }),
    ).toHaveAttribute('href', '/chat');
  });

  it('shows the new-version screen when a reload was already tried', async () => {
    sessionStorage.setItem('bayan:chunk-reload-at', String(Date.now()));
    await show(
      <RouteError
        error={new TypeError('Failed to fetch dynamically imported module')}
      />,
    );
    expect(
      screen.getByRole('heading', { name: ar.common.newVersion.title }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: ar.common.reload }),
    ).toBeVisible();
  });
});

describe('OfflineBanner', () => {
  it('appears only while offline', async () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    await show(<OfflineBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    spy.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent(ar.common.offline);
  });
});
