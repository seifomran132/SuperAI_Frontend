import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Check, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import type { CatalogFindingDto } from '~/api/generated/types.gen';
import { cn } from '~/lib/utils';
import { ApplyDialog, DismissDialog } from '../components/FindingDialogs';
import { FindingCard } from '../components/FindingCard';
import { RunSyncDialog, SyncHeader } from '../components/SyncHeader';
import { SyncSummary } from '../components/SyncSummary';
import {
  useFindings,
  useRunResult,
  useSyncStatus,
} from '../model/catalog-sync';
import {
  FINDING_KINDS,
  FINDING_STATUSES,
  validatePriceUpdatesSearch,
} from '../model/search';

type Dialog =
  { kind: 'run' } | { kind: 'apply' | 'dismiss'; finding: CatalogFindingDto };

const focusRing =
  'outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

/** Price updates: sync status, held price changes, missing catalog prices and retired models. */
export function PriceUpdatesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const search = validatePriceUpdatesSearch(useSearch({ strict: false }));
  const status = search.status ?? 'open';
  const kind = search.kind;
  const sync = useSyncStatus();
  const findings = useFindings(status, kind);
  const run = useRunResult(sync.data, queryClient);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const close = () => setDialog(null);
  const counts = sync.data;

  return (
    <>
      <SyncHeader status={sync} onRun={() => setDialog({ kind: 'run' })} />

      {run.result ? <SyncSummary run={run.result} onClose={run.close} /> : null}

      <nav
        aria-label={t('admin.priceUpdates.tabsLabel')}
        className="border-border-subtle border-b"
      >
        <ul className="flex list-none gap-1 overflow-x-auto">
          {FINDING_STATUSES.map((s) => {
            const active = s === status;
            return (
              <li key={s} className="shrink-0">
                <Link
                  to="/admin/price-updates"
                  search={{
                    ...(s === 'open' ? {} : { status: s }),
                    ...(kind ? { kind } : {}),
                  }}
                  aria-current={active ? 'page' : undefined}
                  // ReasonDialog's focus fallback when the card it opened from is gone.
                  data-section-heading={active ? '' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm',
                    focusRing,
                    active
                      ? 'border-brand text-fg font-bold'
                      : 'text-fg-muted hover:text-fg border-transparent',
                  )}
                >
                  {t(`admin.priceUpdates.tabs.${s}`)}
                  {s === 'open' && counts ? (
                    <span className="bg-surface-muted rounded-full px-2 text-xs leading-5 tabular-nums">
                      {counts.openFindings}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        role="group"
        aria-label={t('admin.priceUpdates.kindsLabel')}
        className="flex min-w-0 gap-2 overflow-x-auto pb-1"
      >
        {[undefined, ...FINDING_KINDS].map((k) => {
          const active = k === kind;
          // Counts are for open findings only.
          const count =
            status === 'open' && counts
              ? k
                ? counts.openByKind[k]
                : counts.openFindings
              : null;
          return (
            <Link
              key={k ?? 'all'}
              to="/admin/price-updates"
              search={{
                ...(status === 'open' ? {} : { status }),
                ...(k ? { kind: k } : {}),
              }}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium',
                focusRing,
                active
                  ? 'bg-brand text-on-brand border-brand'
                  : 'bg-surface text-fg border-border-control hover:bg-surface-muted',
              )}
            >
              {t(`admin.priceUpdates.kinds.${k ?? 'all'}`)}
              {count !== null ? (
                <span className="tabular-nums">{count}</span>
              ) : null}
              {active ? <Check aria-hidden="true" className="size-4" /> : null}
            </Link>
          );
        })}
      </div>

      {findings.isPending ? (
        <p
          role="status"
          className="bg-surface border-border-subtle text-fg-muted flex items-center justify-center gap-2 rounded-lg border p-10"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-5 motion-safe:animate-spin"
          />
          {t('admin.priceUpdates.loading')}
        </p>
      ) : findings.isError ? (
        <RetryAlert onRetry={() => void findings.refetch()}>
          {t('admin.priceUpdates.error')}
        </RetryAlert>
      ) : findings.items.length === 0 ? (
        <div className="bg-surface border-border-subtle grid justify-items-center gap-2 rounded-lg border p-10 text-center">
          <Check aria-hidden="true" className="text-fg-muted size-6" />
          <p className="text-fg text-lg font-semibold">
            {t(`admin.priceUpdates.empty.${status}.title`)}
          </p>
          <p className="text-fg-muted">
            {t(`admin.priceUpdates.empty.${status}.body`)}
          </p>
        </div>
      ) : (
        <>
          <ul
            aria-label={t('admin.priceUpdates.listLabel')}
            className="grid list-none gap-4"
          >
            {findings.items.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onApply={(f) => setDialog({ kind: 'apply', finding: f })}
                onDismiss={(f) => setDialog({ kind: 'dismiss', finding: f })}
              />
            ))}
          </ul>
          {findings.hasNextPage ? (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                loading={findings.isFetchingNextPage}
                onClick={() => void findings.fetchNextPage()}
              >
                {t('admin.priceUpdates.loadMore')}
              </Button>
            </div>
          ) : null}
        </>
      )}

      {dialog?.kind === 'run' ? (
        <RunSyncDialog onClose={close} onStarted={run.watch} />
      ) : null}
      {dialog?.kind === 'apply' ? (
        <ApplyDialog
          finding={dialog.finding}
          onClose={close}
          onRunSync={() => setDialog({ kind: 'run' })}
        />
      ) : null}
      {dialog?.kind === 'dismiss' ? (
        <DismissDialog finding={dialog.finding} onClose={close} />
      ) : null}
    </>
  );
}
