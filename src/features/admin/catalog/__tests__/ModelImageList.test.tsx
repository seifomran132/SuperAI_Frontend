import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogMock, imageModel, mode } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, useCatalogSession } from './harness';

useCatalogSession();

describe('Image models in the lists', () => {
  it('badges only image models in the models list', async () => {
    catalogMock.models = [catalogMock.models[0]!, imageModel('img')];
    await renderApp('/admin/models');
    const rows = await screen.findAllByRole('row');
    const image = rows.find((r) => within(r).queryByText('نموذج صور img'));
    expect(
      within(image!).getByText(a.models.generatesImagesBadge),
    ).toBeInTheDocument();
    expect(screen.getAllByText(a.models.generatesImagesBadge)).toHaveLength(1);
  });

  it('explains an unsupported image provider on the modes list', async () => {
    catalogMock.modes = [
      mode('pic', {
        ready: false,
        notReadyReason: 'IMAGE_GENERATION_UNSUPPORTED',
      }),
    ];
    await renderApp('/admin/modes');
    expect(
      await screen.findByText('مزوّد هذا النموذج لا يدعم إنشاء الصور.'),
    ).toBeInTheDocument();
  });
});
