import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import {
  a,
  reasonField,
  type,
  useCatalogSession,
} from '../../catalog/__tests__/harness';

useCatalogSession();

describe('SettingsSave', () => {
  it('saves the default margin with a reason and shows the prompt counter', async () => {
    await renderApp('/admin/settings');
    expect(await screen.findByText('15 / 10000')).toBeInTheDocument();

    type(a.settings.marginLabel, '35.5');
    fireEvent.click(
      screen.getAllByRole('button', { name: a.catalog.save })[0]!,
    );
    fireEvent.change(reasonField(), { target: { value: 'مراجعة الأسعار' } });
    fireEvent.click(
      screen.getAllByRole('button', { name: a.catalog.save }).at(-1)!,
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(adminCalls('pricing-settings')[0]?.body).toEqual({
      reason: 'مراجعة الأسعار',
      defaultMarginPct: '35.5',
    });
  });
});
