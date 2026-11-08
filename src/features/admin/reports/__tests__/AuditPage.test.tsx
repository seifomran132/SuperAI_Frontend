import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { reportsMock, resetReportsMock } from '~/mocks/reports';
import { renderApp } from '~/test/render-app';
import { useAdminSession } from '../../users/__tests__/harness';

useAdminSession();
beforeEach(() => resetReportsMock());

const au = ar.admin.reports.audit;
const rows = () =>
  within(screen.getByRole('table', { name: au.title })).getAllByRole('row');
const lastCall = () =>
  reportsMock.calls.filter((c) => c.name === 'audit').at(-1)!.query;
const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {
    target: { value },
  });

describe('audit page', () => {
  it('lists newest first, pages with before and expands a row to LTR JSON', async () => {
    await renderApp('/admin/audit');
    await waitFor(() => expect(rows()).toHaveLength(6));
    expect(lastCall()).not.toHaveProperty('before');

    const toggle = screen.getAllByRole('button', {
      name: new RegExp(`^${au.expand}`),
    })[0]!;
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const old = screen.getAllByLabelText(au.oldValue)[0]!;
    const next = screen.getAllByLabelText(au.newValue)[0]!;
    expect(old.tagName).toBe('PRE');
    expect(old).toHaveAttribute('dir', 'ltr');
    expect(old.textContent).toBe(JSON.stringify({ status: 'active' }, null, 2));
    expect(next.textContent).toContain('suspended');

    fireEvent.click(screen.getByRole('button', { name: au.loadMore }));
    await waitFor(() => expect(rows().length).toBeGreaterThan(7));
    expect(lastCall()).toMatchObject({ before: '8' });
  });

  it('sends the filters from the URL and applies new ones to the URL', async () => {
    await renderApp('/admin/audit?action=user.status_changed');
    await waitFor(() => expect(rows()).toHaveLength(6));
    expect(lastCall()).toMatchObject({ action: 'user.status_changed' });

    type(ar.reports.period.from, '2026-10-01');
    type(ar.reports.period.to, '2026-10-05');
    fireEvent.click(screen.getByRole('button', { name: au.filters.apply }));
    await waitFor(() =>
      expect(lastCall()).toMatchObject({
        action: 'user.status_changed',
        from: '2026-10-01',
        to: '2026-10-05',
      }),
    );
  });

  it('refuses an admin id that is not a UUID and sends nothing', async () => {
    await renderApp('/admin/audit');
    await waitFor(() => expect(rows()).toHaveLength(6));
    const calls = reportsMock.calls.length;
    type(au.filters.actorId, 'not-a-uuid');
    fireEvent.click(screen.getByRole('button', { name: au.filters.apply }));
    expect(await screen.findByText(au.errors.actorId)).toBeInTheDocument();
    expect(reportsMock.calls.length).toBe(calls);
  });

  it('refuses a range that ends before it starts', async () => {
    await renderApp('/admin/audit');
    await waitFor(() => expect(rows()).toHaveLength(6));
    type(ar.reports.period.from, '2026-10-10');
    type(ar.reports.period.to, '2026-10-01');
    fireEvent.click(screen.getByRole('button', { name: au.filters.apply }));
    expect(
      await screen.findByText(ar.reports.period.errors.startAfterEnd),
    ).toBeInTheDocument();
  });

  it('drops an invalid admin id from the URL', async () => {
    await renderApp('/admin/audit?actorId=nope');
    await waitFor(() => expect(rows()).toHaveLength(6));
    expect(lastCall()).not.toHaveProperty('actorId');
  });

  it('shows no matches with a way to clear the filters', async () => {
    reportsMock.scenario = 'zeros';
    await renderApp('/admin/audit?resourceType=voucher');
    expect(await screen.findByText(au.emptyFiltered)).toBeInTheDocument();
    reportsMock.scenario = 'normal';
    fireEvent.click(
      screen.getAllByRole('button', { name: au.filters.clear })[0]!,
    );
    await waitFor(() => expect(rows()).toHaveLength(6));
    expect(lastCall()).not.toHaveProperty('resourceType');
  });

  it('shows the empty log, and an error with retry', async () => {
    reportsMock.scenario = 'zeros';
    await renderApp('/admin/audit');
    expect(await screen.findByText(au.empty)).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    reportsMock.scenario = 'error';
    await renderApp('/admin/audit');
    expect(await screen.findByText(au.error)).toBeInTheDocument();
    reportsMock.scenario = 'normal';
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    await waitFor(() => expect(rows()).toHaveLength(6));
  });
});
