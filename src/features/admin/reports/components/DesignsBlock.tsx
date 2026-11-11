import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { DesignUsageDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { formatCount } from '~/lib/numbers';
import { MarginValue } from './MarginValue';

const D = 'admin.reports.designs';

/** S29: graphic designer runs, apart from the chat figures (overview and user usage). */
export function DesignsBlock({
  designs,
  userId,
}: {
  designs: DesignUsageDto;
  /** On a user's usage: a link to that user's runs. */
  userId?: string;
}) {
  const { t } = useTranslation();
  const row = (label: string, value: ReactNode) => (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg text-sm">{label}</dt>
      <dd className="text-fg font-semibold tabular-nums">{value}</dd>
    </div>
  );
  return (
    <section
      aria-labelledby="designs-block"
      className="bg-surface border-border-subtle grid gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="designs-block" className="text-fg text-lg font-semibold">
          {t(`${D}.title`)}
        </h2>
        {userId ? (
          <Link
            to="/admin/agent-runs"
            search={{ userId }}
            className="text-brand focus-visible:outline-focus min-h-11 text-sm font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
          >
            {t(`${D}.userRuns`)}
          </Link>
        ) : null}
      </div>
      <p className="text-fg-subtle text-sm">{t(`${D}.help`)}</p>
      <dl className="grid gap-2 sm:grid-cols-2 sm:gap-x-8">
        {row(t(`${D}.runs`), <bdi dir="ltr">{formatCount(designs.runs)}</bdi>)}
        {row(
          t(`${D}.designs`),
          <bdi dir="ltr">{formatCount(designs.designs)}</bdi>,
        )}
        {row(
          t(`${D}.flagged`),
          <bdi dir="ltr">{formatCount(designs.flaggedRuns)}</bdi>,
        )}
        {row(
          t(`${D}.charged`),
          <Money value={designs.chargedUsd} kind="cost" />,
        )}
        {row(
          t(`${D}.cost`),
          <Money value={designs.providerCostUsd} kind="cost" />,
        )}
        {row(
          t(`${D}.margin`),
          <MarginValue
            stats={{
              marginUsd: designs.marginUsd,
              chargedUsd: designs.chargedUsd,
            }}
          />,
        )}
        {row(
          t(`${D}.absorbed`),
          <Money value={designs.absorbedUsd} kind="cost" />,
        )}
      </dl>
    </section>
  );
}
