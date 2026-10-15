import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogMock } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, useCatalogSession } from './harness';

useCatalogSession();

describe('sidebar badge', () => {
  it('shows the open count on every admin page, said in words', async () => {
    await renderApp('/admin/plans');
    const link = await screen.findByRole('link', {
      name: /^تحديثات الأسعار، 3 بانتظار المراجعة$/,
    });
    expect(link).toHaveAttribute('href', '/admin/price-updates');
    // The visible number is not read a second time.
    expect(
      link.querySelector('[aria-hidden="true"]:not(svg)'),
    ).toHaveTextContent('3');
  });

  it('is hidden at zero: just the name, no number', async () => {
    catalogMock.sync.findings = [];
    await renderApp('/admin/plans');
    const link = await screen.findByRole('link', { name: a.nav.priceUpdates });
    expect(link.textContent).toBe(a.nav.priceUpdates);
    expect(link).not.toHaveAttribute('aria-label');
  });
});
