import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

describe('ModelCreateImageModel', () => {
  it('forces image input on, needs 2,500 output tokens, and sends generatesImages', async () => {
    await renderApp('/admin/models/new?provider=acme&manual=true');
    const reads = await screen.findByRole('checkbox', {
      name: new RegExp(`^${a.models.supportsImages}`),
    });
    const creates = screen.getByRole('checkbox', {
      name: new RegExp(`^${a.models.generatesImages}`),
    });
    expect(reads).not.toBeChecked();
    expect(reads).toBeEnabled();

    fireEvent.click(creates);
    expect(reads).toBeChecked();
    expect(reads).toBeDisabled();
    expect(screen.getByText(a.models.supportsImagesLocked)).toBeInTheDocument();
    expect(screen.getByText(a.models.maxOutputImageHint)).toBeInTheDocument();

    type(a.models.providerModelId, 'img-1');
    type(a.models.displayName, 'صور');
    type(a.models.contextWindow, '32000');
    type(a.models.maxOutput, '2499');
    click(a.models.createSubmit);
    expect(
      (await screen.findAllByText(a.models.maxOutputImageMin)).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    type(a.models.maxOutput, '2500');
    click(a.models.createSubmit);
    await screen.findByRole('dialog');
    fireEvent.change(reasonField(), { target: { value: 'نموذج صور' } });
    fireEvent.click(
      screen.getByRole('button', { name: a.models.createSubmit }),
    );
    await waitFor(() => expect(adminCalls('models:create')).toHaveLength(1));
    expect(adminCalls('models:create')[0]?.body).toMatchObject({
      generatesImages: true,
      supportsImages: true,
      maxOutputTokens: 2500,
    });
  });
});
