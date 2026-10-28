import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { catalogMock, imageModel } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, useCatalogSession } from './harness';

useCatalogSession();

describe('ModelUpdateImageModel', () => {
  it('shows the saved toggle and sends generatesImages when saving', async () => {
    catalogMock.models = [imageModel('img')];
    await renderApp('/admin/models/img');
    const creates = await screen.findByRole('checkbox', {
      name: new RegExp(`^${a.models.generatesImages}`),
    });
    expect(creates).toBeChecked();
    click(a.catalog.save);
    fireEvent.change(
      await screen.findByLabelText(/./, { selector: 'textarea' }),
      {
        target: { value: 'تعديل' },
      },
    );
    expect(reasonField()).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: a.catalog.save }));
    await waitFor(() => expect(adminCalls('models:update')).toHaveLength(1));
    expect(adminCalls('models:update')[0]?.body).toMatchObject({
      generatesImages: true,
      supportsImages: true,
    });
  });
});
