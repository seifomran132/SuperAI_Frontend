import { Link } from '@tanstack/react-router';
import { CreditCard, LogOut, Plus, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { BrandMark, useBrandName } from './BrandMark';
import { ConversationList } from './ConversationList';
import { useSignOut } from './useSignOut';

const footerLink =
  'text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-focus flex min-h-11 items-center gap-3 rounded-md px-3 text-sm outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2';

/**
 * Brand, new chat, recent conversations and the balance/account links. Used
 * as the fixed sidebar (desktop) and inside the drawer (below 1024px), where
 * sign-out lives at the bottom because there is no account menu.
 */
export function Sidebar({
  withSignOut = false,
  onNavigate,
  className,
}: {
  withSignOut?: boolean;
  /** Called after a link is chosen (the drawer closes itself). */
  onNavigate?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const { signOut, pending } = useSignOut();
  const brandName = useBrandName();
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        <BrandMark className="size-9" />
        <span className="text-fg text-lg font-bold">{brandName}</span>
      </div>
      <div className="px-3 pb-3">
        <Button asChild className="w-full">
          <Link to="/chat" onClick={onNavigate}>
            {t('shell.newChat')}
            <Plus aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <nav
        aria-label={t('shell.recent')}
        className="flex min-h-0 flex-1 flex-col px-3"
      >
        <h2 className="text-fg-subtle px-3 pb-2 text-xs font-medium">
          {t('shell.recent')}
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          <ConversationList onNavigate={onNavigate} />
        </div>
      </nav>
      <div className="border-border-subtle flex shrink-0 flex-col gap-0.5 border-t p-3">
        <Link to="/balance" className={footerLink} onClick={onNavigate}>
          <CreditCard aria-hidden="true" className="size-5" />
          {t('shell.balance')}
        </Link>
        <Link to="/account" className={footerLink} onClick={onNavigate}>
          <User aria-hidden="true" className="size-5" />
          {t('shell.account')}
        </Link>
        {withSignOut ? (
          <Button
            type="button"
            variant="ghost"
            loading={pending}
            onClick={() => void signOut()}
            className="text-danger hover:text-danger h-11 justify-start px-3 text-sm font-normal"
          >
            <LogOut aria-hidden="true" className="size-5 rtl:-scale-x-100" />
            {t('shell.signOut')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
