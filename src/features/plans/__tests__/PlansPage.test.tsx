import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import type { PublicPlanDto } from '~/api/generated/types.gen';
import ar from '~/i18n/ar.json';
import { chatMock, resetChatMock } from '~/mocks/chat';
import { server } from '~/mocks/server';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(() => resetChatMock());

const plan = (over: Partial<PublicPlanDto>): PublicPlanDto => ({
  key: 'free',
  nameAr: 'الباقة المجانية',
  nameEn: 'Free',
  descriptionAr: 'وصف',
  descriptionEn: 'desc',
  monthlyPriceUsd: '0.000000000',
  includedBalanceUsd: '0.000000000',
  isDefault: true,
  modes: [],
  ...over,
});

function plansReturn(plans: PublicPlanDto[]) {
  server.use(
    http.get('http://localhost:3000/api/v1/plans', () =>
      HttpResponse.json(plans),
    ),
  );
}

describe('plans page', () => {
  it('signed out: public header, free label, no balance line when it is 0', async () => {
    plansReturn([plan({})]);
    await renderApp('/plans');
    const card = (
      await screen.findByRole('heading', { name: 'الباقة المجانية' })
    ).closest('li')!;
    expect(within(card).getByText(ar.plans.free)).toBeInTheDocument();
    expect(within(card).queryByText(ar.plans.currentBalance)).toBeNull();
    expect(
      screen.getByRole('link', { name: ar.auth.signIn.title }),
    ).toBeInTheDocument();
    expect(screen.queryByText(ar.plans.current)).toBeNull();
  });

  it('shows the included balance when it is above 0', async () => {
    plansReturn([
      plan({
        key: 'pro',
        nameAr: 'احترافية',
        monthlyPriceUsd: '10.000000000',
        includedBalanceUsd: '8.000000000',
        isDefault: false,
      }),
    ]);
    await renderApp('/plans');
    const card = (
      await screen.findByRole('heading', { name: 'احترافية' })
    ).closest('li')!;
    expect(card).toHaveTextContent(`${ar.plans.currentBalance} 8.00$`);
    expect(card).toHaveTextContent('10.00$');
  });

  it('signed in: marks the current plan only', async () => {
    await signInDirectly();
    chatMock.subscription = 'active'; // plan key "basic"
    plansReturn([
      plan({}),
      plan({
        key: 'basic',
        nameAr: 'أساسية',
        monthlyPriceUsd: '10.000000000',
        isDefault: false,
      }),
    ]);
    await renderApp('/plans');
    const current = await screen.findByText(ar.plans.current);
    expect(current.closest('li')).toHaveTextContent('أساسية');
    expect(screen.getAllByText(ar.plans.current)).toHaveLength(1);
    // Inside the app shell: no public sign-in link.
    expect(
      screen.queryByRole('link', { name: ar.auth.signIn.title }),
    ).toBeNull();
  });

  it('shows the empty state', async () => {
    plansReturn([]);
    await renderApp('/plans');
    expect(await screen.findByText(ar.plans.emptyTitle)).toBeInTheDocument();
  });
});
