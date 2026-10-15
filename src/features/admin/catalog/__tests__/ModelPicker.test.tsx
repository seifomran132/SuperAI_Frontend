import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls } from '~/mocks/admin';
import { catalogMock, provider } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, useCatalogSession } from './harness';

useCatalogSession();

const p = a.models.picker;

describe('ModelPicker', () => {
  it('asks for a provider first, and never offers the mock provider', async () => {
    catalogMock.providers.push({ ...provider('mock-ai'), kind: 'mock' });
    await renderApp('/admin/models/new');
    expect(await screen.findByText(p.chooseProvider)).toBeInTheDocument();
    const options = screen
      .getAllByRole('option')
      .map((o) => o.textContent ?? '');
    expect(options.some((o) => o.includes('(acme)'))).toBe(true);
    expect(options.some((o) => o.includes('mock-ai'))).toBe(false);
    expect(adminCalls('providers:available')).toHaveLength(0);
  });

  it('lists the models with price, notes and the added row linking to its model', async () => {
    await renderApp('/admin/models/new?provider=acme');
    const table = await screen.findByRole('table', { name: p.tableLabel });
    const rows = within(table).getAllByRole('row');
    // Header + four models.
    expect(rows).toHaveLength(5);

    const gpt = rows.find((r) => within(r).queryByText('GPT X'))!;
    expect(within(gpt).getByText('2.5$')).toBeInTheDocument();
    expect(within(gpt).getByText('10$')).toBeInTheDocument();
    expect(within(gpt).getByText(p.tiered)).toBeInTheDocument();
    expect(within(gpt).getByText(p.images)).toBeInTheDocument();

    const old = rows.find((r) => within(r).queryByText('Old One'))!;
    expect(within(old).getByText(p.deprecated)).toBeInTheDocument();

    const added = rows.find((r) => within(r).queryByText(p.added))!;
    expect(added).toHaveAttribute('aria-disabled', 'true');
    expect(
      within(added).getByRole('link', { name: p.viewModel }),
    ).toHaveAttribute('href', '/admin/models/m1');
    // The added row cannot be picked.
    expect(
      within(added).queryByRole('link', { name: /اختيار النموذج/ }),
    ).not.toBeInTheDocument();
    // A model without catalog data shows dashes: name, max output, both prices.
    const embed = rows.find((r) => within(r).queryByText('embed-1'))!;
    expect(within(embed).getAllByText('-')).toHaveLength(4);
  });

  it('filters by id or name on the client, and shows the no-match state', async () => {
    await renderApp('/admin/models/new?provider=acme');
    const search = await screen.findByLabelText(p.search);
    fireEvent.change(search, { target: { value: 'old' } });
    const table = screen.getByRole('table', { name: p.tableLabel });
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    fireEvent.change(search, { target: { value: 'nothing-here' } });
    expect(await screen.findByText(p.emptyTitle)).toBeInTheDocument();
    expect(adminCalls('providers:available')).toHaveLength(1);
  });

  it('shows the loading state while the models come', async () => {
    await renderApp('/admin/models/new?provider=acme');
    expect(await screen.findByText(p.loading)).toBeInTheDocument();
    await screen.findByRole('table', { name: p.tableLabel });
  });

  it('a provider without a key shows the no-key state and makes no call', async () => {
    await renderApp('/admin/models/new?provider=nokey');
    expect(await screen.findByText(p.noKeyTitle)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: p.goProviders })).toHaveAttribute(
      'href',
      '/admin/providers',
    );
    expect(adminCalls('providers:available')).toHaveLength(0);
  });

  it('a rejected key links to the key replacement, by error code', async () => {
    catalogMock.sync.available.acme = {
      status: 400,
      code: 'PROVIDER_KEY_INVALID',
    };
    await renderApp('/admin/models/new?provider=acme');
    expect(await screen.findByText(p.keyInvalidTitle)).toBeInTheDocument();
    expect(screen.getByText(errors.PROVIDER_KEY_INVALID)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: p.replaceKey })).toHaveAttribute(
      'href',
      '/admin/providers',
    );
  });

  it('an unreachable provider offers a retry that loads the list', async () => {
    const good = catalogMock.sync.available.acme!;
    catalogMock.sync.available.acme = {
      status: 502,
      code: 'PROVIDER_UNAVAILABLE',
    };
    await renderApp('/admin/models/new?provider=acme');
    expect(await screen.findByText(p.unreachableTitle)).toBeInTheDocument();
    catalogMock.sync.available.acme = good;
    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(
      await screen.findByRole('table', { name: p.tableLabel }),
    ).toBeInTheDocument();
  });

  it('says so when the public catalog is unavailable, and still lists the rows', async () => {
    catalogMock.sync.available.acme = {
      providerCode: 'acme',
      catalogAvailable: false,
      models: [
        {
          providerModelId: 'solo',
          displayName: null,
          contextWindow: 1000,
          maxOutputTokens: null,
          addedModelId: null,
          catalog: null,
        },
      ],
    };
    await renderApp('/admin/models/new?provider=acme');
    expect(await screen.findByText(p.catalogUnavailable)).toBeInTheDocument();
    expect(screen.getByText('solo')).toBeInTheDocument();
  });

  it('shows the empty state for a provider with no models', async () => {
    catalogMock.sync.available.acme = {
      providerCode: 'acme',
      catalogAvailable: true,
      models: [],
    };
    await renderApp('/admin/models/new?provider=acme');
    expect(await screen.findByText(p.emptyListTitle)).toBeInTheDocument();
  });

  it('choosing a row goes to step 2 with the selection in the URL', async () => {
    const { here } = await renderApp('/admin/models/new?provider=acme');
    fireEvent.click(
      await screen.findByRole('link', { name: 'اختيار النموذج gpt-x' }),
    );
    await waitFor(() =>
      expect(here()).toBe('/admin/models/new?provider=acme&model=gpt-x'),
    );
  });

  it('the providers page links each provider to the picker', async () => {
    await renderApp('/admin/providers');
    const link = await screen.findByRole('link', {
      name: /^إضافة نموذج.*acme/,
    });
    expect(link).toHaveAttribute('href', '/admin/models/new?provider=acme');
  });
});
