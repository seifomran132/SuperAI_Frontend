import type { AdminUserDto, SubscriptionDto } from '~/api/generated/types.gen';

/** Name for headings and dialogs: full name, else email, else a fallback. */
export function userLabel(
  user: Pick<AdminUserDto, 'fullName' | 'email'>,
  fallback: string,
) {
  return user.fullName?.trim() || user.email || fallback;
}

/** Subscription status key under `admin.subscription.status.*`, from the API's status and ended reason. */
export function subscriptionStatusKey(sub: SubscriptionDto) {
  return sub.status === 'active' ? 'active' : sub.endedReason;
}

/** Plan name in the UI language. */
export function planName(
  plan: { planNameAr: string; planNameEn: string },
  language: string,
) {
  return language === 'en' ? plan.planNameEn : plan.planNameAr;
}
