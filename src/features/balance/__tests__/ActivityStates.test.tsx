import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ar from '~/i18n/ar.json';
import { resetChatMock } from '~/mocks/chat';
import { server } from '~/mocks/server';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();

// jsdom has no IntersectionObserver: capture the callbacks so a test can scroll "to the end".
type Callback = (entries: { isIntersecting: boolean }[]) => void;
let observers: Callback[] = [];
const scrollToEnd = () =>
  observers.forEach((cb) => cb([{ isIntersecting: true }]));

beforeEach(async () => {
  observers = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: Callback) {
        observers.push(cb);
      }
      observe() {}
      disconnect() {}
    },
  );
  resetChatMock();
  await signInDirectly();
});
afterEach(() => vi.unstubAllGlobals());

const ACTIVITY = 'http://localhost:3000/api/v1/me/balance/activity';
const a = ar.balance.activity;
const serverError = () =>
  HttpResponse.json(
    { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
    { status: 500 },
  );

// Newest first; the API pages by the `sequence` of the oldest entry loaded (`before`).
const entries = Array.from({ length: 35 }, (_, i) => ({
  id: `e${35 - i}`,
  sequence: 35 - i,
  type: 'usage_charge',
  amountUsd: '-0.150000000',
  balanceAfterUsd: '14.480000000',
  createdAt: '2026-01-02T10:30:00.000Z',
}));

function pagedActivity(requests: (string | null)[] = []) {
  server.use(
    http.get(ACTIVITY, ({ request }) => {
      const url = new URL(request.url);
      const limit = Number(url.searchParams.get('limit') ?? 30);
      const before = url.searchParams.get('before');
      requests.push(before);
      const older = entries.filter(
        (e) => before === null || e.sequence < Number(before),
      );
      const items = older.slice(0, limit);
      const more = older.length > items.length;
      return HttpResponse.json({
        items,
        nextBefore: more ? items[items.length - 1]!.sequence : null,
      });
    }),
  );
}

const items = () => screen.getAllByRole('listitem');

describe('balance activity states', () => {
  it('shows a loading skeleton first', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.get(ACTIVITY, async () => {
        await gate;
        return HttpResponse.json({ items: [], nextBefore: null });
      }),
    );
    await renderApp('/balance');
    expect(
      await screen.findByRole('status', { name: a.loading }),
    ).toBeInTheDocument();
    release();
    expect(await screen.findByText(a.emptyTitle)).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: a.loading })).toBeNull();
  });

  it('shows the error and recovers with retry', async () => {
    pagedActivity();
    server.use(http.get(ACTIVITY, serverError, { once: true }));
    await renderApp('/balance');
    expect(await screen.findByText(a.error)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    await waitFor(() => expect(items()).toHaveLength(30));
    expect(screen.queryByText(a.error)).toBeNull();
  });

  it('loads older entries with the before cursor when the end is reached', async () => {
    const requests: (string | null)[] = [];
    pagedActivity(requests);
    await renderApp('/balance');
    await waitFor(() => expect(items()).toHaveLength(30));
    await waitFor(() => expect(observers.length).toBeGreaterThan(0));
    scrollToEnd();
    await waitFor(() => expect(items()).toHaveLength(35));
    // The first page has no cursor; the next continues before the oldest entry loaded.
    expect(requests).toEqual([null, '6']);
    scrollToEnd();
    await new Promise((r) => setTimeout(r, 50));
    expect(requests).toHaveLength(2);
  });

  it('keeps loaded entries when the next page fails and retries it', async () => {
    pagedActivity();
    await renderApp('/balance');
    await waitFor(() => expect(items()).toHaveLength(30));
    server.use(http.get(ACTIVITY, serverError, { once: true }));
    await waitFor(() => expect(observers.length).toBeGreaterThan(0));
    scrollToEnd();
    const message = await screen.findByText(a.moreError, undefined, {
      timeout: 1500,
    });
    expect(items()).toHaveLength(30);
    fireEvent.click(
      within(message.parentElement!).getByRole('button', {
        name: ar.common.retry,
      }),
    );
    await waitFor(() => expect(items()).toHaveLength(35));
  });
});
