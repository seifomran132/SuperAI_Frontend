import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { catalogMock, finding } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;
const card = (name: string) => screen.getByRole('article', { name });

describe('PriceUpdates findings', () => {
  it('shows each kind with its own body, and apply only on a large change', async () => {
    await renderApp('/admin/price-updates');
    const large = within(
      await screen.findByRole('article', { name: 'نموذج f1' }),
    );
    // Both prices, exact, with the change as given.
    expect(large.getByText('4.0625$')).toBeInTheDocument();
    expect(large.getByText('2.5$')).toBeInTheDocument();
    expect(large.getByText('+62.50%')).toBeInTheDocument();
    expect(large.getAllByText(u.card.current)).toHaveLength(4);
    expect(large.getByText(u.kinds.large_change)).toBeInTheDocument();
    expect(
      large.getByRole('button', { name: /^تطبيق السعر/ }),
    ).toBeInTheDocument();
    expect(large.getByRole('button', { name: /^تجاهل/ })).toBeInTheDocument();
    expect(large.getByRole('link', { name: u.card.viewModel })).toHaveAttribute(
      'href',
      '/admin/models/m1',
    );

    const missing = within(card('نموذج f2'));
    expect(missing.getByText(u.card.noCatalogPrice)).toBeInTheDocument();
    expect(missing.getByText('0.15$')).toBeInTheDocument();
    expect(
      missing.getByText(u.card.wontChange, { exact: false }),
    ).toBeInTheDocument();
    expect(missing.queryByRole('button', { name: /^تطبيق السعر/ })).toBeNull();
    expect(missing.getByRole('button', { name: /^تجاهل/ })).toBeInTheDocument();

    const retired = within(card('نموذج f3'));
    expect(retired.getByText(u.card.retiredTitle)).toBeInTheDocument();
    expect(retired.queryByRole('button', { name: /^تطبيق السعر/ })).toBeNull();
    // Mode chips link to the mode, labelled from the admin modes list.
    expect(
      await retired.findByRole('link', { name: 'وضع fast' }),
    ).toHaveAttribute('href', '/admin/modes/fast');
    expect(retired.getByRole('link', { name: 'وضع deep' })).toBeInTheDocument();
  });

  it('says when no enabled mode uses a retired model', async () => {
    catalogMock.sync.findings = [
      finding('f3', 'model_retired', { usedByEnabledModes: [] }),
    ];
    await renderApp('/admin/price-updates');
    expect(await screen.findByText(u.card.noModes)).toBeInTheDocument();
  });

  it('closed tabs show who closed it, when and why, and no actions', async () => {
    catalogMock.sync.findings = [
      finding('f1', 'large_change', {
        status: 'applied',
        resolvedAt: '2026-10-13T14:20:00.000Z',
        resolvedBy: {
          id: 'aaaaaaaa-1111-4111-8111-111111111111',
          email: 'sara.admin@test.local',
        },
        resolutionReason: 'يطابق إعلان المزود',
      }),
      finding('f2', 'catalog_price_missing', {
        status: 'dismissed',
        resolvedAt: '2026-10-13T14:20:00.000Z',
        resolvedBy: { id: 'bbbbbbbb-2222-4222-8222-222222222222', email: null },
        resolutionReason: 'لا حاجة',
      }),
    ];
    await renderApp('/admin/price-updates?status=applied');
    const applied = within(
      await screen.findByRole('article', { name: 'نموذج f1' }),
    );
    expect(
      applied.getByText(u.card.appliedBy, { exact: false }),
    ).toBeInTheDocument();
    expect(
      applied.getByRole('link', { name: 'sara.admin@test.local' }),
    ).toHaveAttribute(
      'href',
      '/admin/users/aaaaaaaa-1111-4111-8111-111111111111',
    );
    expect(applied.getByText('يطابق إعلان المزود')).toBeInTheDocument();
    expect(applied.getAllByText(/2026/).length).toBeGreaterThan(0);
    expect(applied.queryByRole('button')).toBeNull();
    expect(adminCalls('sync:list').at(-1)?.query).toMatchObject({
      status: 'applied',
    });
    // The closed finding only appears under its own tab.
    expect(screen.queryByRole('article', { name: 'نموذج f2' })).toBeNull();

    fireEvent.click(
      screen.getByRole('link', { name: new RegExp(`^${u.tabs.dismissed}`) }),
    );
    const dismissed = within(
      await screen.findByRole('article', { name: 'نموذج f2' }),
    );
    // No email: the short id stands in.
    expect(
      dismissed.getByRole('link', { name: 'bbbbbbbb' }),
    ).toBeInTheDocument();
    expect(
      dismissed.getByText(u.card.dismissedBy, { exact: false }),
    ).toBeInTheDocument();
  });

  it('filters by kind, with counts from the status', async () => {
    const { here } = await renderApp('/admin/price-updates');
    await screen.findByRole('article', { name: 'نموذج f1' });
    const group = within(screen.getByRole('group', { name: u.kindsLabel }));
    expect(
      group.getByRole('link', { name: new RegExp(`^${u.kinds.all}\\s*3`) }),
    ).toBeInTheDocument();
    const chip = group.getByRole('link', {
      name: new RegExp(`^${u.kinds.model_retired}\\s*1`),
    });
    fireEvent.click(chip);
    await waitFor(() =>
      expect(here()).toBe('/admin/price-updates?kind=model_retired'),
    );
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'نموذج f1' })).toBeNull(),
    );
    expect(card('نموذج f3')).toBeInTheDocument();
    expect(adminCalls('sync:list').at(-1)?.query).toMatchObject({
      status: 'open',
      kind: 'model_retired',
    });
    // Chips are 44px touch targets.
    expect(chip.className).toContain('min-h-11');
  });

  it('shows an empty state per tab', async () => {
    catalogMock.sync.findings = [];
    await renderApp('/admin/price-updates?status=superseded');
    expect(
      await screen.findByText(u.empty.superseded.title),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('link', { name: new RegExp(`^${u.tabs.open}`) }),
    );
    expect(await screen.findByText(u.empty.open.title)).toBeInTheDocument();
  });

  it('shows a loading state, then a recoverable error', async () => {
    catalogMock.sync.listFails = true;
    catalogMock.sync.listDelayMs = 300;
    await renderApp('/admin/price-updates');
    expect(await screen.findByText(u.loading)).toBeInTheDocument();
    expect(await screen.findByText(u.error)).toBeInTheDocument();
    catalogMock.sync.listFails = false;
    catalogMock.sync.listDelayMs = 0;
    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(
      await screen.findByRole('article', { name: 'نموذج f1' }),
    ).toBeInTheDocument();
  });

  it('loads more with the cursor', async () => {
    catalogMock.sync.findings = Array.from({ length: 25 }, (_, i) =>
      finding(`g${i}`, 'catalog_price_missing'),
    );
    await renderApp('/admin/price-updates');
    await screen.findByRole('article', { name: 'نموذج g0' });
    expect(screen.getAllByRole('article')).toHaveLength(20);
    const more = screen.getByRole('button', { name: u.loadMore });
    expect(more.className).toContain('h-11');
    fireEvent.click(more);
    await waitFor(() =>
      expect(screen.getAllByRole('article')).toHaveLength(25),
    );
    expect(screen.queryByRole('button', { name: u.loadMore })).toBeNull();
    expect(adminCalls('sync:list').at(-1)?.query).toMatchObject({
      cursor: '20',
    });
  });
});
