import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Money } from '~/components/Money';
import { marginPercent, toDecimal, type MoneyString } from '~/lib/money';
import { formatCount } from '~/lib/numbers';
import { cn } from '~/lib/utils';

const card =
  'bg-surface border-border-subtle grid content-start gap-2 rounded-lg border p-4';

export function StatCard({
  title,
  help,
  children,
  className,
}: {
  title: string;
  help?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(card, className)}>
      <h3 className="text-fg-muted text-sm font-medium">{title}</h3>
      {children}
      {help ? <p className="text-fg-subtle text-sm">{help}</p> : null}
    </section>
  );
}

export function MoneyCard({
  title,
  help,
  value,
}: {
  title: string;
  help: string;
  value: MoneyString;
}) {
  return (
    <StatCard title={title} help={help}>
      <p className="text-fg text-2xl font-bold">
        <Money value={value} />
      </p>
    </StatCard>
  );
}

export function MarginCard({
  margin,
  charged,
}: {
  margin: MoneyString;
  charged: MoneyString;
}) {
  const { t } = useTranslation();
  const negative =
    toDecimal(margin).isNegative() && !toDecimal(margin).isZero();
  const percent = marginPercent(margin, charged);
  return (
    <StatCard
      title={t('admin.reports.overview.money.margin')}
      help={t(
        negative
          ? 'admin.reports.overview.money.marginNegativeHelp'
          : 'admin.reports.overview.money.marginHelp',
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2 text-2xl font-bold',
          negative ? 'text-danger' : 'text-fg',
        )}
      >
        {negative ? (
          <TrendingDown aria-hidden="true" className="size-6" />
        ) : null}
        <Money value={margin} signed={negative} />
      </p>
      {percent !== null ? (
        <p
          className={cn('text-sm', negative ? 'text-danger' : 'text-fg-muted')}
        >
          {t('admin.reports.overview.money.marginPercent')}{' '}
          <bdi dir="ltr">{percent.replace('-', '−')}%</bdi>
        </p>
      ) : null}
    </StatCard>
  );
}

/** A label with a number, used by the users, plans and images cards. */
export function CountRow({
  label,
  value,
  help,
}: {
  label: string;
  value: number;
  help?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg text-sm">
        {label}
        {help ? (
          <span className="text-fg-subtle block text-xs">{help}</span>
        ) : null}
      </dt>
      <dd className="text-fg text-lg font-semibold">
        <bdi dir="ltr" className="tabular-nums">
          {formatCount(value)}
        </bdi>
      </dd>
    </div>
  );
}

export function AttentionCard({
  to,
  title,
  help,
  count,
  zero,
  link,
}: {
  to: '/admin/requests' | '/admin/price-updates';
  title: string;
  help: string;
  count: number;
  zero: string;
  link: string;
}) {
  return (
    <Link
      to={to}
      className="bg-surface border-border-subtle hover:bg-surface-muted focus-visible:outline-focus grid min-h-11 content-start gap-1 rounded-lg border p-4 outline-hidden focus-visible:outline-2 focus-visible:outline-solid"
    >
      <span className="text-fg-muted text-sm font-medium">{title}</span>
      <span className="text-fg text-2xl font-bold">
        {count > 0 ? (
          <bdi dir="ltr" className="tabular-nums">
            {formatCount(count)}
          </bdi>
        ) : (
          <span className="text-lg font-semibold">{zero}</span>
        )}
      </span>
      <span className="text-fg-subtle text-sm">{help}</span>
      <span className="text-brand mt-1 flex items-center gap-1 text-sm font-medium">
        {link}
        <ChevronLeft
          aria-hidden="true"
          className="size-4 rtl:rotate-0 ltr:rotate-180"
        />
      </span>
    </Link>
  );
}
