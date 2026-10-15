import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import {
  adminCatalogSyncApplyMutation,
  adminCatalogSyncDismissMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import type { CatalogFindingDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { ReasonDialog } from '../../components/ReasonDialog';
import { invalidateFindings } from '../model/catalog-sync';
import { invalidateCatalog } from '../model/queries';
import { ChangeChip } from './FindingCard';

/** The finding changed under the admin: refresh the list and say so; the dialog closes. */
const GONE = ['CATALOG_FINDING_NOT_OPEN', 'CATALOG_FINDING_NOT_FOUND'];

interface Props {
  finding: CatalogFindingDto;
  onClose: () => void;
  /** CATALOG_FINDING_OUTDATED offers a sync run. */
  onRunSync: () => void;
}

/** Runs the write; a finding that is gone refreshes the list and shows a toast instead of an error. */
function useFindingWrite(onClose: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return async (write: () => Promise<unknown>, applied: boolean) => {
    try {
      await write();
    } catch (error) {
      if (isApiError(error) && GONE.includes(error.code)) {
        await invalidateFindings(queryClient);
        toast.error(t(errorMessageKey(error)));
        onClose();
        return;
      }
      throw error;
    }
    await Promise.all([
      invalidateFindings(queryClient),
      applied ? invalidateCatalog(queryClient) : undefined,
    ]);
    toast.success(
      t(
        applied
          ? 'admin.priceUpdates.toast.applied'
          : 'admin.priceUpdates.toast.dismissed',
      ),
    );
  };
}

const description = (f: CatalogFindingDto) =>
  `${f.modelDisplayName} · ${f.providerModelId}`;

export function ApplyDialog({ finding, onClose, onRunSync }: Props) {
  const { t } = useTranslation();
  const mutation = useMutation(adminCatalogSyncApplyMutation());
  const run = useFindingWrite(onClose);
  const current = finding.currentPrice;
  const proposed = finding.proposedPrice;
  return (
    <ReasonDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('admin.priceUpdates.dialog.applyTitle')}
      description={description(finding)}
      submitLabel={t('admin.priceUpdates.card.apply')}
      notice={
        <>
          <div className="bg-surface-muted grid gap-2 rounded-lg p-3 text-sm">
            {(
              [
                ['input', 'inputPerMtok'],
                ['output', 'outputPerMtok'],
              ] as const
            ).map(([key, field]) => (
              <p key={key} className="flex flex-wrap justify-between gap-2">
                <span className="text-fg-muted">
                  {t(`admin.priceUpdates.card.rates.${key}`)}{' '}
                  {t('admin.priceUpdates.dialog.perMillion')}
                </span>
                {/* Current, then proposed: the arrow mirrors so it always points at the new price. */}
                <span className="inline-flex items-center gap-1.5">
                  {current ? (
                    <Money value={current[field]} kind="exact" />
                  ) : (
                    '—'
                  )}
                  <ArrowRight
                    aria-hidden="true"
                    className="text-fg-muted size-4 rtl:-scale-x-100"
                  />
                  <span className="sr-only">
                    {t('admin.priceUpdates.dialog.to')}
                  </span>
                  {proposed ? (
                    <Money value={proposed[field]} kind="exact" />
                  ) : (
                    '—'
                  )}
                </span>
              </p>
            ))}
            <p className="flex items-center justify-between gap-2">
              <span className="text-fg-muted">
                {t('admin.priceUpdates.dialog.changeLabel')}
              </span>
              <ChangeChip pct={finding.changePct} />
            </p>
          </div>
          <p className="text-fg-muted text-sm">
            {t('admin.priceUpdates.dialog.applyBody')}
          </p>
        </>
      }
      errorExtra={(error) =>
        isApiError(error) && error.code === 'CATALOG_FINDING_OUTDATED'
          ? {
              lock: true,
              action: (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onRunSync}
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                  {t('admin.priceUpdates.runNow')}
                </Button>
              ),
            }
          : null
      }
      onSubmit={({ reason }) =>
        run(
          () =>
            mutation.mutateAsync({
              path: { id: finding.id },
              body: { reason },
            }),
          true,
        )
      }
    />
  );
}

export function DismissDialog({ finding, onClose }: Omit<Props, 'onRunSync'>) {
  const { t } = useTranslation();
  const mutation = useMutation(adminCatalogSyncDismissMutation());
  const run = useFindingWrite(onClose);
  const retired = finding.kind === 'model_retired';
  return (
    <ReasonDialog
      open
      danger={retired}
      onOpenChange={(open) => !open && onClose()}
      title={t(
        retired
          ? 'admin.priceUpdates.dialog.retiredTitle'
          : 'admin.priceUpdates.dialog.dismissTitle',
      )}
      description={description(finding)}
      submitLabel={t(
        retired
          ? 'admin.priceUpdates.dialog.retiredSubmit'
          : 'admin.priceUpdates.dialog.dismissSubmit',
      )}
      notice={
        retired ? (
          <Alert variant="danger">
            <strong className="block">
              {t('admin.priceUpdates.dialog.retiredNoticeTitle')}
            </strong>
            <span className="font-normal">
              {t('admin.priceUpdates.dialog.retiredNotice')}
            </span>
          </Alert>
        ) : (
          <Alert variant="warning">
            {t('admin.priceUpdates.dialog.dismissNotice')}
          </Alert>
        )
      }
      onSubmit={({ reason }) =>
        run(
          () =>
            mutation.mutateAsync({
              path: { id: finding.id },
              body: { reason },
            }),
          false,
        )
      }
    />
  );
}
