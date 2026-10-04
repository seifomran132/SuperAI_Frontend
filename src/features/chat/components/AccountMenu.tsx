import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, CreditCard, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { meControllerGetOptions } from '~/api/generated/@tanstack/react-query.gen';
import { Money } from '~/components/Money';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useBalance } from '../model/useChatQueries';
import { useSignOut } from './useSignOut';

/** Up to two initials from the name (Arabic has no case, so the first letters). */
export function initialsOf(
  name: string | null | undefined,
  email?: string | null,
) {
  const source = name?.trim() || email?.trim() || '';
  const parts = source.split(/\s+/).filter(Boolean);
  // First letter of the first and last words; one letter for a one-word name.
  const picked = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  const letters = picked.map((p) => Array.from(p ?? '')[0] ?? '');
  return letters.join('') || '?';
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden="true"
      className="bg-brand text-on-brand flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
    >
      {initials}
    </span>
  );
}

/** Header avatar menu (desktop): name and email, balance, account, sign out. */
export function AccountMenu() {
  const { t } = useTranslation();
  const { data: me } = useQuery(meControllerGetOptions());
  const { balanceUsd } = useBalance();
  const { signOut, pending } = useSignOut();
  const initials = initialsOf(me?.fullName, me?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('shell.accountMenu')}
        className="hover:bg-surface-muted focus-visible:outline-focus flex h-11 items-center gap-1 rounded-full ps-1 pe-2 outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Avatar initials={initials} />
        <ChevronDown aria-hidden="true" className="text-fg-muted size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-3 font-normal">
          <Avatar initials={initials} />
          <span className="flex min-w-0 flex-col">
            <span className="text-fg truncate text-sm font-semibold">
              {me?.fullName}
            </span>
            {me?.email ? (
              <bdi
                dir="ltr"
                className="text-fg-muted truncate text-start text-xs"
              >
                {me.email}
              </bdi>
            ) : null}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/balance">
            <CreditCard aria-hidden="true" className="text-fg-muted size-5" />
            <span className="flex-1">{t('shell.balance')}</span>
            {balanceUsd !== undefined ? (
              <span className="text-fg-muted text-sm">
                <Money value={balanceUsd} />
              </span>
            ) : null}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account">
            <User aria-hidden="true" className="text-fg-muted size-5" />
            {t('shell.account')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={pending} onSelect={() => void signOut()}>
          <LogOut
            aria-hidden="true"
            className="text-fg-muted size-5 rtl:-scale-x-100"
          />
          {t('shell.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
