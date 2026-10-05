export const USER_STATUSES = ['active', 'suspended', 'deleted'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USERS_PAGE_SIZE = 20;

export interface UsersSearch {
  q?: string;
  status?: UserStatus;
  isAdmin?: boolean;
  page?: number;
}

/** URL search params of /admin/users; anything malformed is dropped, never thrown. */
export function validateUsersSearch(raw: Record<string, unknown>): UsersSearch {
  const result: UsersSearch = {};
  // The router JSON-parses values, so "123" arrives as a number.
  if (raw.q !== undefined && raw.q !== null && String(raw.q).trim() !== '') {
    result.q = String(raw.q).trim();
  }
  if (USER_STATUSES.includes(raw.status as UserStatus)) {
    result.status = raw.status as UserStatus;
  }
  if (typeof raw.isAdmin === 'boolean') result.isAdmin = raw.isAdmin;
  if (
    typeof raw.page === 'number' &&
    Number.isInteger(raw.page) &&
    raw.page > 1
  ) {
    result.page = raw.page;
  }
  return result;
}

export const USER_TABS = ['overview', 'subscription', 'balance'] as const;
export type UserTab = (typeof USER_TABS)[number];

export const USER_ACTIONS = ['activate-plan', 'add-funds'] as const;
export type UserAction = (typeof USER_ACTIONS)[number];

export interface UserDetailSearch {
  tab?: UserTab;
  /** A dialog to open on arrival (row shortcuts on the users list). */
  action?: UserAction;
}

export function validateUserDetailSearch(
  raw: Record<string, unknown>,
): UserDetailSearch {
  const result: UserDetailSearch = {};
  if (USER_TABS.includes(raw.tab as UserTab)) result.tab = raw.tab as UserTab;
  if (USER_ACTIONS.includes(raw.action as UserAction)) {
    result.action = raw.action as UserAction;
  }
  return result;
}
