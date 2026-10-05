import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, useCatalogSession } from './harness';

useCatalogSession();

describe('PlanModes', () => {
  it('replaces the set of modes on a plan', async () => {
    await renderApp('/admin/plans/basic');
    fireEvent.click(await screen.findByRole('checkbox', { name: 'وضع fast' }));
    click(a.plans.modesSave);

    fireEvent.change(reasonField(), { target: { value: 'إضافة وضع' } });
    fireEvent.click(
      screen.getAllByRole('button', { name: a.plans.modesSave }).at(-1)!,
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(adminCalls('plans:modes')[0]?.body).toEqual({
      reason: 'إضافة وضع',
      modeKeys: ['fast'],
    });
  });
});
