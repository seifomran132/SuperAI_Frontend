import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  modesControllerListQueryKey,
  publicPlansControllerListQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

describe('PlanCreate', () => {
  it('creates a plan with its modes, then refreshes the customer plans and modes', async () => {
    const { queryClient, here } = await renderApp('/admin/plans/new');
    queryClient.setQueryData(publicPlansControllerListQueryKey(), []);
    queryClient.setQueryData(modesControllerListQueryKey(), []);

    await screen.findByLabelText(/^المفتاح/, undefined, { timeout: 5000 });
    type(a.plans.key, 'gold');
    type(a.catalog.nameAr, 'ذهبية');
    type(a.catalog.nameEn, 'Gold');
    type(a.catalog.descriptionAr, 'وصف الباقة');
    type(a.catalog.descriptionEn, 'About');
    type(a.plans.monthlyPrice, '12.5');
    fireEvent.click(await screen.findByRole('checkbox', { name: 'وضع fast' }));
    click(a.plans.createSubmit);

    fireEvent.change(reasonField(), { target: { value: 'باقة جديدة' } });
    fireEvent.click(
      screen.getAllByRole('button', { name: a.plans.createSubmit }).at(-1)!,
    );

    await waitFor(() => expect(here()).toBe('/admin/plans/gold'));
    expect(adminCalls('plans:create')[0]?.body).toMatchObject({
      key: 'gold',
      reason: 'باقة جديدة',
      monthlyPriceUsd: '12.5',
      modeKeys: ['fast'],
    });
    expect(
      queryClient.getQueryState(publicPlansControllerListQueryKey())
        ?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(modesControllerListQueryKey())?.isInvalidated,
    ).toBe(true);
  });
});
