import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogMock, imageModel } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, useCatalogSession } from './harness';

useCatalogSession();

describe('ModelTest when the image model returns no image', () => {
  it('says so instead of showing a preview', async () => {
    catalogMock.models = [imageModel('img')];
    catalogMock.imageReturned = false;
    await renderApp('/admin/models/img');
    fireEvent.click(
      await screen.findByRole('button', { name: a.models.test.open }),
    );
    fireEvent.change(reasonField(), { target: { value: 'فحص' } });
    click(a.models.test.confirmSubmit);
    expect(await screen.findByText(a.models.test.noImage)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByAltText(a.models.test.imageAlt),
    ).not.toBeInTheDocument();
  });
});
