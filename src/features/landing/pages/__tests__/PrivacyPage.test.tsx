import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { brand } from '~/brand';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();

const p = ar.landing.privacy;

describe('PrivacyPage', () => {
  it('shows every section of the interim notice and the contact email', async () => {
    await renderApp('/privacy');
    expect(
      await screen.findByRole('heading', { level: 1, name: p.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(p.interim)).toBeInTheDocument();
    for (const key of [
      'collectTitle',
      'useTitle',
      'shareTitle',
      'whereTitle',
      'rightsTitle',
      'ageTitle',
      'contactTitle',
    ] as const) {
      expect(
        screen.getByRole('heading', { level: 2, name: p[key] }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText(p.whereBody)).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: brand.contact.email })[0],
    ).toHaveAttribute('href', `mailto:${brand.contact.email}`);
  });

  it('stays open for a signed-in visitor', async () => {
    await signInDirectly();
    await renderApp('/privacy');
    expect(
      await screen.findByRole('heading', { level: 1, name: p.title }),
    ).toBeInTheDocument();
  });
});
