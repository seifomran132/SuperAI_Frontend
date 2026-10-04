import { useParams } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { useChatStore } from '../model/chat-store';
import { useConversation } from '../model/useChatQueries';
import { AccountMenu } from './AccountMenu';
import { BalanceChip } from './BalanceChip';

/**
 * Top bar: drawer button (below 1024px), the conversation title, the balance
 * chip and, on desktop, the account menu. No title on a new chat.
 */
export function ChatHeader() {
  const { t } = useTranslation();
  const { conversationId } = useParams({ strict: false });
  const { data: conversation } = useConversation(conversationId);
  const setDrawerOpen = useChatStore((s) => s.setDrawerOpen);
  const title = conversationId ? conversation?.title : null;

  return (
    <header className="bg-surface border-border-subtle flex h-16 shrink-0 items-center gap-3 border-b px-3 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        data-drawer-opener
        className="lg:hidden"
        aria-label={t('shell.openMenu')}
        onClick={() => setDrawerOpen(true)}
      >
        <Menu aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1">
        {title ? (
          <h1 dir="auto" className="text-fg truncate text-lg font-semibold">
            {title}
          </h1>
        ) : null}
      </div>
      <BalanceChip />
      <div className="hidden lg:block">
        <AccountMenu />
      </div>
    </header>
  );
}
