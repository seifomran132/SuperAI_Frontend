import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errorsAr from '~/i18n/errors.ar.json';
import { adminMock } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

describe('PlanForm', () => {
  it('shows the default-plan balance cap on the balance field', async () => {
    await renderApp('/admin/plans/basic');
    await screen.findByLabelText(a.plans.includedBalance, { exact: false });
    // The mock plan has no descriptions; the form requires them.
    type(a.catalog.descriptionAr, 'وصف الباقة');
    type(a.catalog.descriptionEn, 'About');
    click(a.catalog.save);

    fireEvent.change(reasonField(), { target: { value: 'تجربة' } });
    adminMock.fail = { status: 409, code: 'DEFAULT_PLAN_BALANCE_TOO_HIGH' };
    fireEvent.click(
      screen.getAllByRole('button', { name: a.catalog.save }).at(-1)!,
    );

    // In the dialog's error and under the balance field.
    await waitFor(() =>
      expect(
        screen.getAllByText(errorsAr.DEFAULT_PLAN_BALANCE_TOO_HIGH).length,
      ).toBeGreaterThanOrEqual(2),
    );
  });
});
