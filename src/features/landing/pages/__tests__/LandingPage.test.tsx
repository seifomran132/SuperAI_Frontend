import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { PublicPlanDto } from '~/api/generated/types.gen';
import { brand } from '~/brand';
import { server } from '~/mocks/server';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();

const PLANS_URL = 'http://localhost:3000/api/v1/plans';

const plan = (over: Partial<PublicPlanDto>): PublicPlanDto => ({
  key: 'pro',
  nameAr: 'الباقة الاحترافية',
  nameEn: 'Pro',
  descriptionAr: 'وصف',
  descriptionEn: 'desc',
  monthlyPriceUsd: '20.000000000',
  includedBalanceUsd: '15.000000000',
  isDefault: false,
  modes: [
    {
      key: 'fast',
      labelAr: 'سريع جدًا',
      labelEn: 'Very fast',
      descriptionAr: 'وصف',
      descriptionEn: 'desc',
    },
  ],
  ...over,
});

function plansReturn(plans: PublicPlanDto[]) {
  server.use(http.get(PLANS_URL, () => HttpResponse.json(plans)));
}

const freePlan = plan({
  key: 'free',
  nameAr: 'مجانية',
  monthlyPriceUsd: '0.000000000',
  isDefault: true,
});

describe('landing page', () => {
  it('shows the tagline, all three modes and the way to sign up', async () => {
    plansReturn([plan({})]);
    await renderApp('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: brand.tagline.ar }),
    ).toBeInTheDocument();
    for (const title of [
      ar.landing.modes.fastTitle,
      ar.landing.modes.proTitle,
      ar.landing.modes.imageTitle,
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    const signUp = screen.getAllByRole('link', { name: ar.auth.signUp.title });
    expect(signUp[0]).toHaveAttribute('href', '/sign-up');
  });

  it('stays on the page for a signed-out visitor', async () => {
    plansReturn([]);
    const { here } = await renderApp('/');
    await screen.findByRole('heading', { level: 1 });
    expect(here()).toBe('/');
  });

  it('sends a signed-in visitor to the chat', async () => {
    await signInDirectly();
    plansReturn([]);
    const { here } = await renderApp('/');
    await waitFor(() => expect(here()).toBe('/chat'));
  });

  it('lists paid plans only, with live prices and mode labels', async () => {
    plansReturn([freePlan, plan({})]);
    await renderApp('/');
    const name = await screen.findByRole('heading', {
      name: 'الباقة الاحترافية',
    });
    const card = name.closest('li')!;
    expect(screen.queryByRole('heading', { name: 'مجانية' })).toBeNull();
    expect(within(card).getByText('سريع جدًا')).toBeInTheDocument();
    expect(card.querySelectorAll('bdi').length).toBe(2);
    expect(
      within(card).getByRole('link', { name: ar.plans.subscribe }),
    ).toHaveAttribute('href', '#how-to-get-a-plan');
  });

  it('explains when no paid plan is available', async () => {
    plansReturn([freePlan]);
    await renderApp('/');
    expect(await screen.findByText(ar.plans.emptyBody)).toBeInTheDocument();
  });

  it('recovers from a plans error, and still links to all plans', async () => {
    let fail = true;
    server.use(
      http.get(PLANS_URL, () =>
        fail
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json([plan({})]),
      ),
    );
    await renderApp('/');
    expect(await screen.findByText(ar.plans.error)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: ar.landing.plans.all }),
    ).toHaveAttribute('href', '/plans');
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(
      await screen.findByRole('heading', { name: 'الباقة الاحترافية' }),
    ).toBeInTheDocument();
  });

  it('hides the legal links until the brand has published them', async () => {
    plansReturn([]);
    await renderApp('/');
    await screen.findByRole('heading', { level: 1 });
    expect(
      screen.queryByRole('link', { name: ar.landing.footer.terms }),
    ).toBeNull();
    expect(
      screen.queryByRole('link', { name: ar.landing.footer.privacy }),
    ).toBeNull();
  });

  it('fills the brand name into the copy', async () => {
    plansReturn([]);
    await renderApp('/');
    expect(
      await screen.findByText(
        ar.landing.faq.q4.replace('{{brandName}}', brand.name.ar),
      ),
    ).toBeInTheDocument();
  });
});
