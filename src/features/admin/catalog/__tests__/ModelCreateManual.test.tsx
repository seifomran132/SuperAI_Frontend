import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

const p = a.models.picker;

describe('ModelCreateManual', () => {
  it('manual entry opens an empty form with the provider chosen', async () => {
    const { here } = await renderApp('/admin/models/new?provider=acme');
    fireEvent.click(await screen.findByRole('link', { name: p.manual }));
    await waitFor(() => expect(here()).toContain('manual=true'));
    expect(await screen.findByLabelText(/^الاسم الداخلي/)).toHaveValue('');
    expect(screen.getByLabelText(/^المزوّد/)).toHaveValue('acme');
    expect(screen.queryByText(p.fromCatalog)).not.toBeInTheDocument();

    type(a.models.providerModelId, 'custom-1');
    type(a.models.displayName, 'مخصص');
    type(a.models.contextWindow, '8000');
    type(a.models.maxOutput, '1000');
    click(a.models.createSubmit);
    fireEvent.change(reasonField(), { target: { value: 'يدوي' } });
    fireEvent.click(
      screen.getByRole('button', { name: a.models.createSubmit }),
    );
    await waitFor(() => expect(adminCalls('models:create')).toHaveLength(1));
    expect(adminCalls('models:create')[0]?.body).toMatchObject({
      providerCode: 'acme',
      providerModelId: 'custom-1',
      displayName: 'مخصص',
    });
  });
});
