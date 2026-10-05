import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '~/test/render-app';
import { a, useCatalogSession } from './harness';

useCatalogSession();

describe('ModeReadiness', () => {
  it('lists ready and not-ready modes with the reason', async () => {
    await renderApp('/admin/modes');
    expect(await screen.findByText(a.modes.ready)).toBeInTheDocument();
    expect(screen.getByText(a.modes.notReady)).toBeInTheDocument();
    expect(screen.getByText(a.modes.reasons.NO_API_KEY)).toBeInTheDocument();
  });

  it('explains why a mode is not ready on its page', async () => {
    await renderApp('/admin/modes/deep');
    expect(
      await screen.findByText(a.modes.reasons.NO_API_KEY),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^تعليمات النظام الخاصة بالوضع/),
    ).toHaveAttribute('dir', 'auto');
  });
});
