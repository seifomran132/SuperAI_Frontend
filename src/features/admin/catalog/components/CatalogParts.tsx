import { Link } from '@tanstack/react-router';
import { Check, ChevronRight, CircleOff, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { Badge } from '../../components/Badge';

type Area = '/admin/plans' | '/admin/models' | '/admin/modes';

/** Loading / recoverable error; renders `children` once data is there. */
export function QueryState({
  query,
  error,
  children,
}: {
  query: { isPending: boolean; isError: boolean; refetch: () => unknown };
  error: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (query.isPending) {
    return (
      <p role="status" className="text-fg-muted p-10 text-center">
        {t('admin.common.loading')}
      </p>
    );
  }
  if (query.isError) {
    return (
      <RetryAlert onRetry={() => void query.refetch()}>{error}</RetryAlert>
    );
  }
  return <>{children}</>;
}

/** Link to the "new" form, shown above a list. */
export function NewLink({ to, label }: { to: `${Area}/new`; label: string }) {
  return (
    <div className="flex justify-end">
      <Link to={to} className={cn(buttonVariants({ variant: 'primary' }))}>
        <Plus aria-hidden="true" className="size-5" />
        {label}
      </Link>
    </div>
  );
}

export function BackLink({ to, label }: { to: Area; label: string }) {
  return (
    <Link
      to={to}
      className="text-brand focus-visible:outline-focus inline-flex min-h-11 w-fit items-center gap-1 font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      {label}
    </Link>
  );
}

/** White table container with the standard empty state. */
export function TableCard({
  empty,
  children,
}: {
  empty?: { title: string; body: string } | null;
  children: ReactNode;
}) {
  return (
    <section className="bg-surface border-border-subtle overflow-hidden rounded-lg border">
      {empty ? (
        <div className="p-10 text-center">
          <p className="text-fg text-lg font-semibold">{empty.title}</p>
          <p className="text-fg-muted mt-1">{empty.body}</p>
        </div>
      ) : (
        <div className="relative overflow-x-auto">{children}</div>
      )}
    </section>
  );
}

/** Yes/no status pill (colour never the only signal). */
export function FlagBadge({
  on,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return on ? (
    <Badge tone="success" Icon={Check}>
      {onLabel}
    </Badge>
  ) : (
    <Badge tone="neutral" Icon={CircleOff}>
      {offLabel}
    </Badge>
  );
}

/** A value that is always left-to-right (ids, URLs, model ids). */
export function Ltr({ children }: { children: ReactNode }) {
  return (
    <bdi dir="ltr" className="break-all">
      {children}
    </bdi>
  );
}

export function NotFoundCard({
  title,
  body,
  to,
  back,
}: {
  title: string;
  body: string;
  to: Area;
  back: string;
}) {
  return (
    <div className="bg-surface border-border-subtle grid justify-items-center gap-3 rounded-lg border p-10 text-center">
      <h2 className="text-fg text-xl font-bold">{title}</h2>
      <p className="text-fg-muted">{body}</p>
      <BackLink to={to} label={back} />
    </div>
  );
}
