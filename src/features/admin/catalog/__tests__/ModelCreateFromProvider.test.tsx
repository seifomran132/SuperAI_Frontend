import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

const p = a.models.picker;

describe('ModelCreateFromProvider', () => {
  it('warns about a model the provider is retiring', async () => {
    await renderApp('/admin/models/new?provider=acme&model=old-1');
    expect(await screen.findByText(p.deprecatedWarning)).toBeInTheDocument();
    expect(screen.queryByText(p.tiersWarning)).not.toBeInTheDocument();
  });

  it('asks for input and output prices together', async () => {
    await renderApp('/admin/models/new?provider=acme&model=embed-1');
    await screen.findByLabelText(/^نافذة السياق/);
    type(a.models.maxOutput, '2000');
    type(a.models.cachedPrice, '0.5');
    click(a.models.createSubmit);
    expect(await screen.findAllByText(p.priceIncomplete)).toHaveLength(2);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('points to the existing model when the chosen one is already added', async () => {
    await renderApp('/admin/models/new?provider=acme&model=acme-m1');
    expect(await screen.findByText(p.modelAddedTitle)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: p.viewModel })).toHaveAttribute(
      'href',
      '/admin/models/m1',
    );
  });

  it('prefills from the catalog, tags the values, and creates model and price in one call', async () => {
    const { here } = await renderApp(
      '/admin/models/new?provider=acme&model=gpt-x',
    );
    // Provider and id are fixed, with a way back to step 1.
    expect(await screen.findByText('gpt-x')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: p.change })).toHaveAttribute(
      'href',
      '/admin/models/new?provider=acme',
    );
    expect(screen.getByLabelText(/^الاسم الداخلي/)).toHaveValue('GPT X');
    expect(screen.getByLabelText(/^نافذة السياق/)).toHaveValue('128000');
    expect(screen.getAllByLabelText(/^سعر الدخل/)[0]).toHaveValue(
      '2.500000000',
    );
    expect(screen.getAllByText(p.fromCatalog).length).toBeGreaterThan(5);
    // Warnings: tiered price in the catalog section.
    expect(screen.getByText(p.tiersWarning)).toBeInTheDocument();
    expect(screen.queryByText(p.deprecatedWarning)).not.toBeInTheDocument();

    // Editing a value drops its tag.
    const before = screen.getAllByText(p.fromCatalog).length;
    type(a.models.displayName, 'GPT X (داخلي)');
    expect(screen.getAllByText(p.fromCatalog)).toHaveLength(before - 1);

    click(a.models.createSubmit);
    fireEvent.change(reasonField(), { target: { value: 'إضافة من المزود' } });
    fireEvent.click(
      screen.getByRole('button', {
        name: a.models.createSubmit,
        hidden: false,
      }),
    );
    await waitFor(() => expect(here()).toMatch(/^\/admin\/models\/.+/));

    const calls = adminCalls('models:create');
    expect(calls).toHaveLength(1);
    expect(adminCalls('models:set-price')).toHaveLength(0);
    expect(calls[0]?.body).toMatchObject({
      reason: 'إضافة من المزود',
      providerCode: 'acme',
      providerModelId: 'gpt-x',
      displayName: 'GPT X (داخلي)',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      supportsImages: true,
      isEnabled: false,
      // Prices are the catalog strings, untouched.
      price: {
        inputPerMtok: '2.500000000',
        outputPerMtok: '10.000000000',
        cachedInputPerMtok: '1.250000000',
        cacheWritePerMtok: null,
      },
    });
  });
});
