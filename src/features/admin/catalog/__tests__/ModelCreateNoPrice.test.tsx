import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

describe('ModelCreateNoPrice', () => {
  it('sends no price when the price fields are left empty', async () => {
    const { here } = await renderApp(
      '/admin/models/new?provider=acme&model=embed-1',
    );
    await screen.findByLabelText(/^نافذة السياق/);
    type(a.models.maxOutput, '2000');
    click(a.models.createSubmit);
    fireEvent.change(reasonField(), { target: { value: 'بدون سعر' } });
    fireEvent.click(
      screen.getByRole('button', { name: a.models.createSubmit }),
    );
    await waitFor(() => expect(here()).toBe('/admin/models/created'));
    expect(adminCalls('models:create')).toHaveLength(1);
    expect(adminCalls('models:create')[0]?.body).not.toHaveProperty('price');
  });
});
