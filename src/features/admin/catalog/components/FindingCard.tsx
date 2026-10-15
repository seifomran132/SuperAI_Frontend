import { Link } from '@tanstack/react-router';
import {
  Ban,
  Check,
  ChevronLeft,
  CircleAlert,
  Info,
  TriangleAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  CatalogFindingDto,
  FindingRatesDto,
} from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { Badge, type BadgeTone } from '../../components/Badge';
import { useModeLabel } from '../model/queries';
import { useWhen } from '../model/when';
import { Ltr } from './CatalogParts';

const RATES = [
  ['inputPerMtok', 'input'],
  ['outputPerMtok', 'output'],
  ['cachedInputPerMtok', 'cachedInput'],
  ['cacheWritePerMtok', 'cacheWrite'],
] as const;

const KIND_BADGE: Record<
  CatalogFindingDto['kind'],
  { tone: BadgeTone; Icon: typeof Info }
> = {
  large_change: { tone: 'warning', Icon: TriangleAlert },
  catalog_price_missing: { tone: 'neutral', Icon: Info },
  model_retired: { tone: 'danger', Icon: CircleAlert },
};

const textLink =
  'text-brand focus-visible:outline-focus inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2';

/** A price, or «—» when the finding has none for that rate. */
function Price({ value }: { value: string | null | undefined }) {
  const { t } = useTranslation();
  return value ? (
    <Money value={value} kind="exact" />
  ) : (
    <span aria-label={t('admin.common.none')}>—</span>
  );
}

/** Current and proposed price of one rate; four of these sit in a row on desktop, one column on mobile. */
function RateBlock({
  label,
  current,
  proposed,
}: {
  label: string;
  current: string | null;
  proposed: string | null;
}) {
  const { t } = useTranslation();
  return (
    <div className="border-border-subtle bg-surface-muted grid content-start gap-1 rounded-lg border p-3 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="flex justify-between gap-3">
        <span className="text-fg-muted">
          {t('admin.priceUpdates.card.current')}
        </span>
        <Price value={current} />
      </span>
      <span className="flex justify-between gap-3">
        <span className="text-fg-muted">
          {t('admin.priceUpdates.card.proposed')}
        </span>
        <span className="font-bold">
          <Price value={proposed} />
        </span>
      </span>
    </div>
  );
}

/** «+62.50%», as the API gives it (no arithmetic), or «من الصفر» when there was no price. */
export function ChangeChip({ pct }: { pct: string | null }) {
  const { t } = useTranslation();
  return (
    <span className="bg-warning-container text-warning border-warning-border inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold">
      {pct === null ? (
        t('admin.priceUpdates.card.fromZero')
      ) : (
        // The API signs only decreases; a rise reads clearer with its `+`.
        <bdi dir="ltr">
          {pct.startsWith('-') || /^0(\.0+)?$/.test(pct) ? pct : `+${pct}`}%
        </bdi>
      )}
    </span>
  );
}

export function ratesLine(rates: FindingRatesDto, t: (key: string) => string) {
  return (
    <>
      {t('admin.priceUpdates.card.rates.input')}{' '}
      <Money value={rates.inputPerMtok} kind="exact" />
      {' · '}
      {t('admin.priceUpdates.card.rates.output')}{' '}
      <Money value={rates.outputPerMtok} kind="exact" />
    </>
  );
}

function ModeChips({ keys }: { keys: string[] }) {
  const { t } = useTranslation();
  const label = useModeLabel();
  return (
    <div className="grid gap-2">
      <p className="text-fg text-sm font-semibold">
        {t('admin.priceUpdates.card.modesUsing')}
      </p>
      {keys.length === 0 ? (
        <p className="text-fg-muted text-sm">
          {t('admin.priceUpdates.card.noModes')}
        </p>
      ) : (
        <ul className="flex list-none flex-wrap gap-2">
          {keys.map((key) => (
            <li key={key}>
              <Link
                to="/admin/modes/$key"
                params={{ key }}
                className="bg-mode-1-container text-mode-1 border-mode-1-border focus-visible:outline-focus inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {label(key)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Who closed a finding, when, and why (closed tabs only). */
function Resolution({ finding }: { finding: CatalogFindingDto }) {
  const { t } = useTranslation();
  const when = useWhen();
  if (!finding.resolvedAt) return null;
  const by = finding.resolvedBy;
  const lead =
    finding.status === 'applied'
      ? 'appliedBy'
      : finding.status === 'dismissed'
        ? 'dismissedBy'
        : 'closedBySync';
  return (
    <div className="bg-surface-muted grid gap-1 rounded-lg p-3 text-sm">
      <p>
        <strong>
          {t(`admin.priceUpdates.card.${lead}`)}
          {by ? ' ' : ''}
        </strong>
        {by ? (
          <Link
            to="/admin/users/$userId"
            params={{ userId: by.id }}
            className="text-brand font-semibold underline-offset-4 hover:underline"
          >
            <bdi dir="ltr">{by.email ?? by.id.slice(0, 8)}</bdi>
          </Link>
        ) : null}
      </p>
      <p className="text-fg-muted">{when(finding.resolvedAt)}</p>
      {finding.resolutionReason ? (
        <p>
          <span className="text-fg-muted">
            {t('admin.priceUpdates.card.reason')}:
          </span>{' '}
          {finding.resolutionReason}
        </p>
      ) : null}
    </div>
  );
}

/** One finding: what changed, who it affects, and (while open) apply / dismiss. */
export function FindingCard({
  finding,
  onApply,
  onDismiss,
}: {
  finding: CatalogFindingDto;
  onApply: (finding: CatalogFindingDto) => void;
  onDismiss: (finding: CatalogFindingDto) => void;
}) {
  const { t } = useTranslation();
  const when = useWhen();
  const badge = KIND_BADGE[finding.kind];
  const retired = finding.kind === 'model_retired';
  const open = finding.status === 'open';
  const current = finding.currentPrice;
  const proposed = finding.proposedPrice;
  return (
    <li
      className={cn(
        'bg-surface grid gap-4 rounded-lg border p-5',
        retired ? 'border-danger-border' : 'border-border-subtle',
      )}
    >
      <article className="grid gap-4" aria-label={finding.modelDisplayName}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="grid gap-1">
            <h3 className="text-fg text-lg font-bold">
              {finding.modelDisplayName}
            </h3>
            <p className="text-fg-muted flex flex-wrap items-center gap-2 text-sm">
              <Ltr>{finding.providerModelId}</Ltr>
              <Ltr>{finding.providerCode}</Ltr>
              {finding.kind === 'large_change' ? (
                <ChangeChip pct={finding.changePct} />
              ) : null}
            </p>
          </div>
          <Badge tone={badge.tone} Icon={badge.Icon}>
            {t(`admin.priceUpdates.kinds.${finding.kind}`)}
          </Badge>
        </div>

        {finding.kind === 'large_change' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RATES.map(([field, key]) => (
              <RateBlock
                key={field}
                label={t(`admin.priceUpdates.card.rates.${key}`)}
                current={current?.[field] ?? null}
                proposed={proposed?.[field] ?? null}
              />
            ))}
          </div>
        ) : null}

        {finding.kind === 'catalog_price_missing' ? (
          <Alert variant="warning">
            <strong className="block">
              {t('admin.priceUpdates.card.noCatalogPrice')}
            </strong>
            <span className="font-normal">
              {current ? (
                <>
                  {t('admin.priceUpdates.card.currentPriceIs')}:{' '}
                  {ratesLine(current, t)}.{' '}
                </>
              ) : null}
              {t('admin.priceUpdates.card.wontChange')}
            </span>
          </Alert>
        ) : null}

        {retired ? (
          <>
            <Alert variant="danger">
              <strong className="block">
                {t('admin.priceUpdates.card.retiredTitle')}
              </strong>
              <span className="font-normal">
                {t('admin.priceUpdates.card.retiredBody')}
              </span>
            </Alert>
            <ModeChips keys={finding.usedByEnabledModes} />
          </>
        ) : null}

        <Resolution finding={finding} />

        <div className="border-border-subtle flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-fg-muted text-sm">
            {t('admin.priceUpdates.card.firstSeen')}: {when(finding.createdAt)}
            <span className="mx-1">·</span>
            {t('admin.priceUpdates.card.lastSeen')}: {when(finding.lastSeenAt)}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/models/$id"
              params={{ id: finding.modelId }}
              className={cn(textLink, 'inline-flex items-center gap-1')}
            >
              {t('admin.priceUpdates.card.viewModel')}
              <ChevronLeft
                aria-hidden="true"
                className="size-4 ltr:-scale-x-100"
              />
            </Link>
            {open && finding.kind === 'large_change' ? (
              <Button
                onClick={() => onApply(finding)}
                aria-label={`${t('admin.priceUpdates.card.apply')}: ${finding.modelDisplayName}`}
              >
                <Check aria-hidden="true" />
                {t('admin.priceUpdates.card.apply')}
              </Button>
            ) : null}
            {open ? (
              <Button
                variant="secondary"
                onClick={() => onDismiss(finding)}
                aria-label={`${t(
                  retired
                    ? 'admin.priceUpdates.dialog.retiredSubmit'
                    : 'admin.priceUpdates.card.dismiss',
                )}: ${finding.modelDisplayName}`}
              >
                <Ban aria-hidden="true" />
                {t('admin.priceUpdates.card.dismiss')}
              </Button>
            ) : null}
          </div>
        </div>
      </article>
    </li>
  );
}
