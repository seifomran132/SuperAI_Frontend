import { useEffect, useRef } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import type { ConversationDto } from '~/api/generated/types.gen';
import { cn } from '~/lib/utils';
import { useIsStreaming } from '../model/active-streams';
import { useConversations } from '../model/useChatQueries';
import { formatRelative } from './relative-time';
import { TypingDots } from './TypingDots';

/** A conversation with no title has no messages yet; it is not worth listing. */
export const hasTitle = (
  c: ConversationDto,
): c is ConversationDto & { title: string } => Boolean(c.title?.trim());

function Row({
  conversation,
  active,
  onNavigate,
}: {
  onNavigate?: () => void;
  conversation: ConversationDto & { title: string };
  active: boolean;
}) {
  const { t, i18n } = useTranslation();
  const writing = useIsStreaming(conversation.id);
  return (
    <Link
      to="/chat/$conversationId"
      params={{ conversationId: conversation.id }}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'focus-visible:outline-focus relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2',
        active
          ? 'bg-surface-muted text-fg font-semibold'
          : 'text-fg hover:bg-surface-muted/70',
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="bg-brand absolute inset-y-2 start-0 w-[3px] rounded-e-full"
        />
      ) : null}
      <span dir="auto" className="min-w-0 flex-1 truncate text-start">
        {conversation.title}
      </span>
      <span className="text-fg-muted shrink-0 text-xs tabular-nums">
        {writing ? (
          <span className="text-fg-muted inline-flex items-center gap-1.5">
            <TypingDots />
            {t('shell.writing')}
          </span>
        ) : (
          formatRelative(conversation.lastMessageAt, i18n.language)
        )}
      </span>
    </Link>
  );
}

function Skeleton({ rows = 6, label }: { rows?: number; label: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-2 px-1">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="bg-surface-muted h-11 animate-pulse rounded-md"
        />
      ))}
    </div>
  );
}

/** Newest first; older conversations load as the list is scrolled to its end. */
export function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { conversationId } = useParams({ strict: false });
  const {
    conversations,
    status,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useConversations();
  const nextPageError: boolean = isFetchNextPageError;
  const sentinel = useRef<HTMLDivElement>(null);
  const titled = conversations.filter(hasTitle);

  useEffect(() => {
    const el = sentinel.current;
    if (
      !el ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) void fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    titled.length,
  ]);

  if (status === 'pending') {
    return <Skeleton label={t('shell.list.loading')} />;
  }
  // A failed next page keeps the loaded rows; its own retry shows below them.
  if (status === 'error' && !isFetchNextPageError) {
    return (
      <Alert
        variant="danger"
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
          >
            {t('common.retry')}
          </Button>
        }
      >
        {t('shell.list.error')}
      </Alert>
    );
  }
  if (titled.length === 0 && !hasNextPage) {
    return (
      <div className="text-fg-muted flex flex-col gap-1 px-3 py-6 text-center">
        <p className="text-fg text-sm font-semibold">
          {t('shell.list.emptyTitle')}
        </p>
        <p className="text-sm">{t('shell.list.emptyBody')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <ul className="flex flex-col gap-0.5">
        {titled.map((c) => (
          <li key={c.id}>
            <Row
              conversation={c}
              active={c.id === conversationId}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
      {nextPageError ? (
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <span className="text-danger text-xs">
            {t('shell.list.moreError')}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void fetchNextPage()}
          >
            {t('common.retry')}
          </Button>
        </div>
      ) : null}
      {isFetchingNextPage ? (
        <Skeleton rows={2} label={t('shell.list.loadingMore')} />
      ) : null}
      {hasNextPage ? (
        <div ref={sentinel} aria-hidden="true" className="h-px" />
      ) : null}
    </div>
  );
}
