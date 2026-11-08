import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { OverviewCountDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { formatCount } from '~/lib/numbers';
import { cn } from '~/lib/utils';
import { useModeLabel } from '../../catalog/model/queries';

// Static class names so Tailwind sees them; colours follow the position, not the name.
const DOTS = ['bg-mode-1', 'bg-mode-2', 'bg-mode-3', 'bg-mode-4'];

function TopList({
  title,
  firstColumn,
  rows,
  name,
  dot,
}: {
  title: string;
  firstColumn: string;
  rows: OverviewCountDto[];
  name: (row: OverviewCountDto) => ReactNode;
  dot?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <section className="bg-surface border-border-subtle grid min-w-0 content-start gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-fg text-base font-medium">{title}</h3>
        <span className="text-fg-subtle text-sm">
          {t('admin.reports.overview.tops.limit')}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-fg-muted text-sm">
          {t('admin.reports.overview.tops.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="text-fg-muted">
                <th scope="col" className="py-2 text-start font-medium">
                  {firstColumn}
                </th>
                <th scope="col" className="py-2 text-start font-medium">
                  {t('admin.reports.overview.tops.requests')}
                </th>
                <th scope="col" className="py-2 text-end font-medium">
                  {t('admin.reports.overview.tops.charged')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.key} className="border-border-subtle border-t">
                  <th
                    scope="row"
                    className="text-fg py-3 text-start font-normal"
                  >
                    <span className="flex items-center gap-2">
                      {dot ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            'size-2.5 shrink-0 rounded-full',
                            DOTS[index % DOTS.length],
                          )}
                        />
                      ) : null}
                      {name(row)}
                    </span>
                  </th>
                  <td className="py-3">
                    <bdi dir="ltr" className="tabular-nums">
                      {formatCount(row.requests)}
                    </bdi>
                  </td>
                  <td className="py-3 text-end">
                    <Money value={row.chargedUsd} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function TopLists({
  modes,
  models,
}: {
  modes: OverviewCountDto[];
  models: OverviewCountDto[];
}) {
  const { t } = useTranslation();
  const modeLabel = useModeLabel();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TopList
        title={t('admin.reports.overview.tops.modes')}
        firstColumn={t('admin.reports.overview.tops.mode')}
        rows={modes}
        dot
        name={(row) => modeLabel(row.key)}
      />
      <TopList
        title={t('admin.reports.overview.tops.models')}
        firstColumn={t('admin.reports.overview.tops.model')}
        rows={models}
        name={(row) => (
          <bdi dir="ltr" className="break-all">
            {row.key}
          </bdi>
        )}
      />
    </div>
  );
}
