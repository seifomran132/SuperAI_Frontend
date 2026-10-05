import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { useActivity } from '../model/queries';
import { ActivityRow } from './ActivityRow';

function Skeleton({ rows, label }: { rows: number; label: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="grid">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <span className="bg-surface-muted size-10 animate-pulse rounded-full" />
          <span className="bg-surface-muted h-9 flex-1 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** «سجل العمليات»: newest first, older entries load as the end comes into view. */
export function ActivityList() {
  const { t } = useTranslation();
  const {
    entries,
    status,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useActivity();
  const nextPageError: boolean = isFetchNextPageError;
  const sentinel = useRef<HTMLDivElement>(null);

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
    const observer = new IntersectionObserver((hits) => {
      if (hits.some((h) => h.isIntersecting)) void fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    entries.length,
  ]);

  let body;
  if (status === 'pending') {
    body = <Skeleton rows={4} label={t('balance.activity.loading')} />;
  } else if (status === 'error') {
    body = (
      <div className="p-4">
        <RetryAlert onRetry={() => void refetch()}>
          {t('balance.activity.error')}
        </RetryAlert>
      </div>
    );
  } else if (entries.length === 0) {
    body = (
      <div className="text-fg-muted flex flex-col gap-1 px-4 py-10 text-center">
        <p className="text-fg text-base font-semibold">
          {t('balance.activity.emptyTitle')}
        </p>
        <p className="text-sm">{t('balance.activity.emptyBody')}</p>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="divide-border-subtle divide-y">
          {entries.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))}
        </ul>
        {nextPageError ? (
          <div className="border-border-subtle flex items-center justify-between gap-3 border-t px-4 py-2">
            <span className="text-danger text-sm">
              {t('balance.activity.moreError')}
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
          <Skeleton rows={2} label={t('balance.activity.loadingMore')} />
        ) : null}
        {hasNextPage ? (
          <div ref={sentinel} aria-hidden="true" className="h-px" />
        ) : null}
      </>
    );
  }

  return (
    <section aria-labelledby="activity-title" className="grid gap-3">
      <h2 id="activity-title" className="text-fg text-xl font-bold">
        {t('balance.activity.title')}
      </h2>
      <div className="bg-surface border-border-subtle overflow-hidden rounded-lg border">
        {body}
      </div>
    </section>
  );
}
