import { fireEvent, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import ar from '~/i18n/ar.json';
import { resetAdminMock, sara } from '~/mocks/admin';
import { authMock, defaultProfile } from '~/mocks/auth';
import { resetChatMock } from '~/mocks/chat';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

export const a = ar.admin;

/** Mocks and an admin session; call once at the top of a test file. */
export function useAdminSession() {
  useAuthMocks();
  beforeEach(async () => {
    resetChatMock();
    resetAdminMock();
    authMock.me = { kind: 'ok', profile: { ...defaultProfile, isAdmin: true } };
    await signInDirectly();
  });
}

export const reasonField = () => screen.getByLabelText(/^السبب/);
export const click = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }));

export async function openUser(tab: 'overview' | 'subscription' | 'balance') {
  await renderApp(`/admin/users/${sara.id}?tab=${tab}`);
  await screen.findByRole('heading', { name: sara.fullName! });
}

export const activeSub = {
  id: 'sub-1',
  planKey: 'basic',
  planNameAr: 'باقة basic',
  planNameEn: 'Plan basic',
  status: 'active' as const,
  endedReason: 'replaced' as const,
  source: 'admin' as const,
  priceUsd: '10.000000000',
  includedBalanceUsd: '8.000000000',
  startedAt: '2026-10-01T00:00:00.000Z',
  currentPeriodEnd: '2026-11-01T00:00:00.000Z',
  endedAt: null,
  assignedBy: null,
};
