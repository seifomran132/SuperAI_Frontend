import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDay } from '~/lib/period';
import { cn } from '~/lib/utils';

export interface ChartTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
}

const headCell =
  'bg-surface-muted text-fg-muted border-border-subtle sticky top-0 border-b px-4 py-2 text-start font-medium';

/**
 * The table version of a daily chart: exact values for screen readers and anyone who
 * wants numbers. Rows run oldest first (the order the data arrives in).
 */
export function ChartTable<T extends { date: string }>({
  rows,
  columns,
  caption,
  className,
}: {
  rows: readonly T[];
  columns: readonly ChartTableColumn<T>[];
  caption: string;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  return (
    <div
      // Focusable so keyboard users can scroll it with the arrow keys.
      tabIndex={0}
      role="region"
      aria-label={caption}
      className={cn(
        'border-border-subtle max-h-80 overflow-auto rounded-md border',
        className,
      )}
    >
      <table className="w-full min-w-max border-collapse text-start text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={headCell}>
              {t('reports.chart.date')}
            </th>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={headCell}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.date}
              className="border-border-subtle border-b last:border-b-0"
            >
              <th
                scope="row"
                className="text-fg px-4 py-2 text-start font-normal"
              >
                {formatDay(row.date, i18n.language)}
              </th>
              {columns.map((column) => (
                <td key={column.key} className="text-fg px-4 py-2 tabular-nums">
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
