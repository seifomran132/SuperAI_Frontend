import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  CatalogSyncSummaryDto,
  LastSyncRunDto,
} from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { useWhen } from '../model/when';

type Count = Exclude<
  {
    [K in keyof CatalogSyncSummaryDto]: CatalogSyncSummaryDto[K] extends number
      ? K
      : never;
  }[keyof CatalogSyncSummaryDto],
  never
>;

/** Always shown (the result of the run at a glance). */
const HEADLINE: Count[] = [
  'checked',
  'applied',
  'unchanged',
  'held',
  'noCatalogPrice',
  'notInCatalog',
];
/** Shown only when above zero. */
const SMALL: Count[] = [
  'skipped',
  'failed',
  'providersChecked',
  'providersUnreachable',
  'ignored',
];

/** Result of the run that just finished, from `lastRun.summary`. Not stored: it goes when the page is left. */
export function SyncSummary({
  run,
  onClose,
}: {
  run: LastSyncRunDto;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const when = useWhen();
  const summary = run.summary;
  if (!summary) return null;
  const label = (key: Count) => t(`admin.priceUpdates.summary.${key}`);
  const small = SMALL.filter((key) => summary[key] > 0);
  return (
    <section
      aria-label={t('admin.priceUpdates.summary.title')}
      className="bg-surface border-border-subtle grid gap-4 rounded-lg border p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="text-fg text-lg font-bold">
            {t('admin.priceUpdates.summary.title')}
          </h3>
          <span className="text-fg-muted text-sm">
            {when(run.finishedAt)}
            <span className="mx-1">·</span>
            {t(`admin.priceUpdates.triggers.${run.trigger}`)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('admin.priceUpdates.summary.close')}
          className="-mt-2 -me-2"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      {summary.catalogAvailable ? (
        <ul className="grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {HEADLINE.map((key) => (
            <li
              key={key}
              className="border-border-subtle grid content-start gap-1 rounded-lg border p-3"
            >
              <span className="text-fg text-2xl font-bold tabular-nums">
                {summary[key]}
              </span>
              <span className="text-fg-muted text-sm">{label(key)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Alert variant="warning">
          <strong className="block">
            {t('admin.priceUpdates.summary.noCatalogTitle')}
          </strong>
          <span className="font-normal">
            {t('admin.priceUpdates.summary.noCatalogBody')}
          </span>
        </Alert>
      )}

      {small.length > 0 ? (
        <dl className="text-fg-muted flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {small.map((key) => (
            <div key={key} className="flex gap-1">
              <dt>{label(key)}:</dt>
              <dd className="text-fg font-bold tabular-nums">{summary[key]}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {summary.retired > 0 ? (
        <Alert variant="danger">
          <strong className="block">
            {label('retired')}: {summary.retired}
          </strong>
          {summary.retiredInUse > 0 ? (
            <span className="font-normal">
              {t('admin.priceUpdates.summary.retiredInUse', {
                n: summary.retiredInUse,
              })}
            </span>
          ) : null}
        </Alert>
      ) : null}
    </section>
  );
}
