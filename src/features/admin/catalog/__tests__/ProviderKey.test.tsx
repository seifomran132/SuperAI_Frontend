import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

describe('ProviderKey', () => {
  it('sends the key, clears the field after sending, and never shows it back', async () => {
    await renderApp('/admin/providers');
    expect(await screen.findByText('••••1234')).toBeInTheDocument();
    expect(screen.getByText(a.providers.noKey)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /^تعيين المفتاح.*nokey/ }),
    );
    type(a.providers.keyLabel, 'sk-secret-5678');
    const field = screen.getByLabelText(/^مفتاح الواجهة البرمجية/);
    expect(field).toHaveAttribute('type', 'password');
    fireEvent.change(reasonField(), { target: { value: 'مفتاح جديد' } });

    adminMock.fail = { status: 400, code: 'PROVIDER_KEY_INVALID' };
    const submit = () =>
      fireEvent.click(
        screen.getByRole('button', { name: a.providers.setKeySubmit }),
      );
    submit();
    expect(
      await screen.findByText(errors.PROVIDER_KEY_INVALID),
    ).toBeInTheDocument();
    // Cleared even though the backend refused it.
    expect(field).toHaveValue('');

    adminMock.fail = null;
    type(a.providers.keyLabel, 'sk-secret-5678');
    submit();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    expect(adminCalls('providers:set-key')).toHaveLength(2);
    expect(adminCalls('providers:set-key')[1]?.body).toEqual({
      reason: 'مفتاح جديد',
      apiKey: 'sk-secret-5678',
    });
    // Only the last four characters are shown afterwards.
    expect(await screen.findAllByText('••••5678')).not.toHaveLength(0);
    expect(document.body.textContent).not.toContain('sk-secret');
  });
});
