import { fireEvent, screen, within } from '@testing-library/react';

import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { resetChatMock } from '~/mocks/chat';
import { reportsMock, resetReportsMock } from '~/mocks/reports';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  resetReportsMock();
  await signInDirectly();
});

const PAST = '2026-08';

describe('my usage page', () => {
  it('shows totals, modes and the daily chart for the current month', async () => {
    await renderApp('/usage');
    expect(
      await screen.findByRole('heading', { name: ar.usage.byMode.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(ar.usage.charged)).toBeInTheDocument();
    expect(screen.getByText('احترافي')).toBeInTheDocument();
    expect(screen.getByText(ar.usage.chart.title)).toBeInTheDocument();
    // Per-answer cost, tokens, providers and models are never shown.
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/gemini|google|openai|claude|anthropic/i);
    expect(text).not.toMatch(/token|توكن/i);
  });

  it('shows a removed mode as «وضع محذوف»', async () => {
    await renderApp('/usage');
    const row = (await screen.findByText(ar.usage.byMode.removed)).closest(
      'tr',
    ) as HTMLElement;
    expect(within(row).queryByText('old-mode')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain('old-mode');
  });

  it('shows designs apart from the messages, even in a month with no messages', async () => {
    reportsMock.scenario = 'zeros';
    reportsMock.myDesigns = [
      {
        agentKey: 'graphic_designer',
        labelAr: 'مصمم جرافيك',
        labelEn: 'Graphic designer',
        runs: 3,
        designs: 5,
        chargedUsd: '1.120000000',
      },
    ];
    await renderApp('/usage');
    expect(
      await screen.findByRole('heading', { name: ar.usage.designs.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('rowheader', { name: 'مصمم جرافيك' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1.12$')).toBeInTheDocument();
    expect(screen.queryByText(ar.usage.empty.title)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: ar.usage.byMode.title }),
    ).not.toBeInTheDocument();
  });

  it('offers a new chat when the current month is empty', async () => {
    reportsMock.scenario = 'zeros';
    await renderApp('/usage');
    expect(await screen.findByText(ar.usage.empty.title)).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).getByRole('link', {
        name: ar.shell.newChat,
      }),
    ).toHaveAttribute('href', '/chat');
    expect(screen.getByText(/ابدأ محادثة جديدة/)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: ar.usage.byMode.title }),
    ).not.toBeInTheDocument();
  });

  it('offers no action and no new-chat text for an empty past month', async () => {
    reportsMock.scenario = 'zeros';
    const { here } = await renderApp(`/usage?month=${PAST}`);
    expect(await screen.findByText(ar.usage.empty.title)).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).queryByRole('link', {
        name: ar.shell.newChat,
      }),
    ).not.toBeInTheDocument();
    const main = within(screen.getByRole('main'));
    expect(main.queryByRole('button', { name: /العودة/ })).toBeNull();
    expect(main.queryByText(/ابدأ محادثة جديدة/)).toBeNull();
    expect(here()).toBe(`/usage?month=${PAST}`);
  });

  it('shows an error and retries', async () => {
    reportsMock.scenario = 'error';
    await renderApp('/usage');
    expect(await screen.findByText(ar.usage.error)).toBeInTheDocument();
    // The picker stays visible while the data is broken.
    expect(
      screen.getByRole('group', { name: ar.reports.month.label }),
    ).toBeInTheDocument();
    reportsMock.scenario = 'normal';
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(
      await screen.findByRole('heading', { name: ar.usage.byMode.title }),
    ).toBeInTheDocument();
  });

  it('writes the chosen month to the URL and requests it', async () => {
    const { here } = await renderApp('/usage');
    await screen.findByRole('heading', { name: ar.usage.byMode.title });
    fireEvent.click(
      screen.getByRole('button', { name: ar.reports.month.previous }),
    );
    await screen.findByRole('heading', { name: ar.usage.byMode.title });
    expect(here()).toMatch(/^\/usage\?month=\d{4}-\d{2}$/);
    const month = here().split('=')[1];
    expect(
      reportsMock.calls.some(
        (c) => c.name === 'my-usage' && c.query.month === month,
      ),
    ).toBe(true);
  });

  it('falls back to the current month for a future month in the URL', async () => {
    await renderApp('/usage?month=2999-01');
    await screen.findByRole('heading', { name: ar.usage.byMode.title });
    expect(reportsMock.calls.every((c) => c.query.month !== '2999-01')).toBe(
      true,
    );
  });
});
