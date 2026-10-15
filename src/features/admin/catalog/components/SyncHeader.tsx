import type { ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { isApiError } from '~/api/errors';
import {
  adminCatalogSyncRunMutation,
  adminCatalogSyncStatusQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';
import type { CatalogSyncStatusDto } from '~/api/generated/types.gen';
import { RetryAlert } from '~/components/RetryAlert';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { ReasonDialog } from '../../components/ReasonDialog';
import { isSyncStale } from '../model/catalog-sync';
import { useWhen } from '../model/when';

/** «تشغيل المزامنة الآن»: reason, then `202`; a run already going just switches to the running state. */
export function RunSyncDialog({
  onClose,
  onStarted,
}: {
  onClose: () => void;
  onStarted: (runId: string) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminCatalogSyncRunMutation());
  const refreshStatus = () =>
    queryClient.invalidateQueries({
      queryKey: adminCatalogSyncStatusQueryKey(),
    });
  return (
    <ReasonDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('admin.priceUpdates.dialog.runTitle')}
      description={t('admin.priceUpdates.dialog.runDescription')}
      submitLabel={t('admin.priceUpdates.dialog.runSubmit')}
      notice={
        <p className="text-fg text-sm">
          {t('admin.priceUpdates.dialog.runBody')}
        </p>
      }
      onSubmit={async ({ reason }) => {
        try {
          const started = await mutation.mutateAsync({ body: { reason } });
          onStarted(started.runId);
          toast.success(t('admin.priceUpdates.toast.runStarted'));
        } catch (error) {
          if (isApiError(error) && error.code === 'CATALOG_SYNC_RUNNING') {
            toast.info(t('admin.priceUpdates.toast.runAlready'));
          } else {
            throw error;
          }
        }
        await refreshStatus();
      }}
    />
  );
}

/** Explanation, run button, last and next run, and the failed / stale notices. */
export function SyncHeader({
  status,
  onRun,
}: {
  status: {
    data?: CatalogSyncStatusDto;
    isError: boolean;
    refetch: () => unknown;
  };
  onRun: () => void;
}) {
  const { t } = useTranslation();
  const when = useWhen();
  const data = status.data;
  const running = data?.running ?? null;
  const last = data?.lastRun ?? null;
  const trigger = (kind: 'schedule' | 'admin') =>
    t(`admin.priceUpdates.triggers.${kind}`);
  // Announced on change only: the run starting, then finishing or failing.
  const live = running
    ? t('admin.priceUpdates.running')
    : last
      ? t(
          last.error
            ? 'admin.priceUpdates.live.failed'
            : 'admin.priceUpdates.live.finished',
        )
      : '';
  return (
    <section className="bg-surface border-border-subtle grid gap-4 rounded-lg border p-5">
      <p role="status" aria-live="polite" className="sr-only">
        {live}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid min-w-0 flex-1 gap-3">
          <p className="text-fg text-sm leading-6">
            {t('admin.priceUpdates.intro')}
          </p>
          {data ? (
            <dl className="text-fg-muted flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <MetaItem Icon={Clock} label={t('admin.priceUpdates.lastRun')}>
                {last ? (
                  <>
                    {when(last.finishedAt)}
                    <span className="mx-1">·</span>
                    {t('admin.priceUpdates.trigger')}: {trigger(last.trigger)}
                  </>
                ) : (
                  t('admin.priceUpdates.neverRun')
                )}
              </MetaItem>
              {running ? (
                <MetaItem
                  Icon={RefreshCw}
                  label={t('admin.priceUpdates.startedAt')}
                >
                  {when(running.startedAt)}
                  <span className="mx-1">·</span>
                  {trigger(running.trigger)}
                </MetaItem>
              ) : null}
              <MetaItem
                Icon={CalendarClock}
                label={t('admin.priceUpdates.nextRun')}
              >
                {data.nextRunAt ? when(data.nextRunAt) : t('admin.common.none')}
              </MetaItem>
            </dl>
          ) : null}
        </div>
        <Button
          variant="primary"
          // aria-disabled, not disabled: focus returns here when the run dialog closes.
          aria-disabled={running ? true : undefined}
          aria-busy={running ? true : undefined}
          className={running ? 'cursor-not-allowed opacity-60' : undefined}
          onClick={() => {
            if (!running) onRun();
          }}
        >
          <RefreshCw
            aria-hidden="true"
            className={running ? 'motion-safe:animate-spin' : undefined}
          />
          {t(
            running
              ? 'admin.priceUpdates.running'
              : 'admin.priceUpdates.runNow',
          )}
        </Button>
      </div>

      {status.isError ? (
        <RetryAlert onRetry={() => void status.refetch()}>
          {t('admin.priceUpdates.statusError')}
        </RetryAlert>
      ) : null}

      {last?.error ? (
        <Alert variant="danger">
          <strong className="block">
            {t('admin.priceUpdates.failedTitle')}
          </strong>
          <span className="font-normal">{when(last.finishedAt)}</span>
          <details className="mt-2 font-normal">
            <summary className="min-h-11 cursor-pointer py-2.5">
              {t('admin.priceUpdates.failedDetails')}
            </summary>
            {/* A developer string, always left to right; admins only. */}
            <bdi dir="ltr" className="block text-start break-words">
              {last.error}
            </bdi>
          </details>
        </Alert>
      ) : null}

      {data && isSyncStale(data) ? (
        <Alert variant="warning">{t('admin.priceUpdates.stale')}</Alert>
      ) : null}
    </section>
  );
}

function MetaItem({
  Icon,
  label,
  children,
}: {
  Icon: typeof Clock;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <dt className="font-medium">{label}:</dt>
      <dd>{children}</dd>
    </div>
  );
}
