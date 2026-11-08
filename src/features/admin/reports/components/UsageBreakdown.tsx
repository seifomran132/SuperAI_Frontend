import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { UsageTotalsDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { formatCount } from '~/lib/numbers';
import { cn } from '~/lib/utils';
import { MarginValue } from './MarginValue';

export interface BreakdownRow {
  key: string;
  title: ReactNode;
  stats: UsageTotalsDto;
}

const th = 'text-fg-muted px-4 py-3 text-start text-sm font-medium';
const td = 'px-4 py-3 text-sm';

/** «حسب الوضع» / «حسب النموذج»: a table from `md` up, cards on phones. */
export function UsageBreakdown({
  label,
  nameHeader,
  rows,
}: {
  label: string;
  nameHeader: string;
  rows: BreakdownRow[];
}) {
  const { t } = useTranslation();
  const c = (key: string) => t(`admin.reports.usage.columns.${key}`);
  return (
    <>
      <div className="relative hidden overflow-x-auto md:block">
        <table aria-label={label} className="w-full border-collapse">
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className={th}>
                {nameHeader}
              </th>
              <th scope="col" className={th}>
                {c('requests')}
              </th>
              <th scope="col" className={th}>
                {c('charged')}
              </th>
              <th scope="col" className={th}>
                {c('providerCost')}
              </th>
              <th scope="col" className={th}>
                {c('margin')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-border-subtle border-t">
                <td className={cn(td, 'text-fg font-medium')}>{row.title}</td>
                <td className={cn(td, 'tabular-nums')}>
                  {formatCount(row.stats.requests)}
                </td>
                <td className={td}>
                  <Money value={row.stats.chargedUsd} />
                </td>
                <td className={td}>
                  <Money value={row.stats.providerCostUsd} />
                </td>
                <td className={td}>
                  <MarginValue stats={row.stats} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label={label} className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.key}
            className="border-border-subtle bg-surface grid gap-3 rounded-md border p-4"
          >
            <div className="text-fg font-medium">{row.title}</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-fg-muted">{c('requests')}</dt>
                <dd className="tabular-nums">
                  {formatCount(row.stats.requests)}
                </dd>
              </div>
              <div>
                <dt className="text-fg-muted">{c('charged')}</dt>
                <dd>
                  <Money value={row.stats.chargedUsd} />
                </dd>
              </div>
              <div>
                <dt className="text-fg-muted">{c('providerCost')}</dt>
                <dd>
                  <Money value={row.stats.providerCostUsd} />
                </dd>
              </div>
              <div>
                <dt className="text-fg-muted">{c('margin')}</dt>
                <dd>
                  <MarginValue stats={row.stats} />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
