import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  catalogMock,
  imageModel,
  TINY_PNG_BASE64,
} from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, useCatalogSession } from './harness';

useCatalogSession();

describe('ModelTest with an image model', () => {
  it('previews the created image with its size', async () => {
    catalogMock.models = [imageModel('img')];
    await renderApp('/admin/models/img');
    fireEvent.click(
      await screen.findByRole('button', { name: a.models.test.open }),
    );
    fireEvent.change(reasonField(), { target: { value: 'فحص' } });
    click(a.models.test.confirmSubmit);
    const img = await screen.findByAltText(a.models.test.imageAlt);
    expect(img).toHaveAttribute(
      'src',
      `data:image/png;base64,${TINY_PNG_BASE64}`,
    );
    expect(screen.getByText('68 بايت')).toBeInTheDocument();
    expect(screen.queryByText(a.models.test.noImage)).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });
});
