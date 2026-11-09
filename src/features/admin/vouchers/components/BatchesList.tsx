import { Link, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VoucherBatchDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import { Button, buttonVariants } from '~/components/ui/button';
import { formatDate } from '~/lib/dates';
import { cn } from '~/lib/utils';
import { selectClass, td, th } from '../../components/FormControls';
import { batchStatus, percentOf, useBatches } from '../model/batches';
import type { VoucherFilter } from '../model/search';
import { KindBadge, StatusBadge } from './Badges';
import { ProgressBar } from './ProgressBar';
import { VoucherValue } from './VoucherValue';

const nameLink =
  'text-brand focus-visible:outline-focus inline-flex min-h-11 items-center font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid';

function Name({ batch }: { batch: VoucherBatchDto }) {
  return (
    <Link
      to="/admin/vouchers/batches/$batchId"
      params={{ batchId: batch.id }}
      className={nameLink}
    >
      {batch.name}
    </Link>
  );
}

function Progress({ batch }: { batch: VoucherBatchDto }) {
  return (
    <span className="grid gap-1">
      <bdi dir="ltr" className="text-start tabular-nums">
        {batch.redeemedCount} / {batch.quantity}
      </bdi>
      <ProgressBar percent={percentOf(batch.redeemedCount, batch.quantity)} />
    </span>
  );
}

const Total = ({ batch }: { batch: VoucherBatchDto }) =>
  batch.totalValueUsd ? <Money value={batch.totalValueUsd} /> : <>-</>;

function Ends({ batch }: { batch: VoucherBatchDto }) {
  const { t, i18n } = useTranslation();
  return (
    <>
      {batch.endsAt
        ? formatDate(batch.endsAt, i18n.language)
        : t('admin.vouchers.noEnd')}
    </>
  );
}

const columns = [
  'name',
  'kind',
  'value',
  'usage',
  'total',
  'status',
  'ends',
] as const;

function Table({ batches }: { batches: VoucherBatchDto[] }) {
  const { t } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  const now = new Date();
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table
          aria-label={b('tableLabel')}
          className="w-full min-w-[880px] border-collapse"
        >
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className={th}>
                  {b(`columns.${c}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border-subtle divide-y">
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td className={td}>
                  <Name batch={batch} />
                </td>
                <td className={td}>
                  <KindBadge kind={batch.kind} />
                </td>
                <td className={td}>
                  <VoucherValue voucher={batch} />
                </td>
                <td className={td}>
                  <Progress batch={batch} />
                </td>
                <td className={td}>
                  <Total batch={batch} />
                </td>
                <td className={td}>
                  <StatusBadge status={batchStatus(batch, now)} />
                </td>
                <td className={td}>
                  <Ends batch={batch} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul
        aria-label={b('tableLabel')}
        className="divide-border-subtle divide-y md:hidden"
      >
        {batches.map((batch) => (
          <li key={batch.id} className="grid gap-2 p-4">
            <Name batch={batch} />
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={batch.kind} />
              <StatusBadge status={batchStatus(batch, now)} />
            </div>
            <Progress batch={batch} />
            <dl className="text-fg-muted grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt>{b('columns.value')}</dt>
              <dd className="text-fg">
                <VoucherValue voucher={batch} />
              </dd>
              <dt>{b('columns.total')}</dt>
              <dd className="text-fg">
                <Total batch={batch} />
              </dd>
              <dt>{b('columns.ends')}</dt>
              <dd className="text-fg">
                <Ends batch={batch} />
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

/** S23 frame 1: the Batches tab of the Vouchers page. */
export function BatchesList({ status }: { status: VoucherFilter | undefined }) {
  const { t } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  const navigate = useNavigate({ from: '/admin/vouchers/' });
  const list = useBatches(status);
  const setStatus = (value: string) =>
    void navigate({
      to: '/admin/vouchers',
      search: {
        tab: 'batches',
        ...(value ? { status: value as VoucherFilter } : {}),
      },
      replace: true,
    });
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          aria-label={t('admin.vouchers.filter.label')}
          value={status ?? ''}
          onChange={(event) => setStatus(event.target.value)}
          className={cn(selectClass, 'w-auto min-w-40')}
        >
          <option value="">
            {t('admin.vouchers.filter.label')}: {t('admin.vouchers.filter.all')}
          </option>
          <option value="active">{t('admin.vouchers.filter.active')}</option>
          <option value="inactive">
            {t('admin.vouchers.filter.inactive')}
          </option>
        </select>
        <Link
          to="/admin/vouchers/batches/new"
          className={cn(buttonVariants({ variant: 'primary' }))}
        >
          <Plus aria-hidden="true" className="size-5" />
          {b('new')}
        </Link>
      </div>
      <section className="bg-surface border-border-subtle overflow-hidden rounded-lg border">
        {list.isPending ? (
          <p role="status" className="text-fg-muted p-10 text-center">
            {t('admin.common.loading')}
          </p>
        ) : !list.data ? (
          <div className="p-4">
            <RetryAlert onRetry={() => void list.refetch()}>
              {b('error')}
            </RetryAlert>
          </div>
        ) : list.items.length === 0 ? (
          <div className="grid justify-items-center gap-3 p-10 text-center">
            <p className="text-fg text-lg font-semibold">
              {status ? b(`emptyFiltered.${status}`) : b('emptyTitle')}
            </p>
            <p className="text-fg-muted">
              {status ? b('emptyFilteredBody') : b('emptyBody')}
            </p>
            {status ? (
              <Button variant="secondary" onClick={() => setStatus('')}>
                {t('admin.vouchers.showAll')}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <Table batches={list.items} />
            {list.isError ? (
              <div className="p-4">
                <RetryAlert onRetry={() => void list.fetchNextPage()}>
                  {t('admin.vouchers.loadMoreError')}
                </RetryAlert>
              </div>
            ) : null}
            {list.hasNextPage ? (
              <div className="border-border-subtle flex justify-center border-t p-4">
                <Button
                  variant="secondary"
                  loading={list.isFetchingNextPage}
                  onClick={() => void list.fetchNextPage()}
                >
                  {t('admin.vouchers.loadMore')}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
