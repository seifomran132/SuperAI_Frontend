import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { VoucherRedemptionDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { formatActivityDate } from '~/lib/dates';
import { ShortId } from '../../components/ShortId';
import { Section } from '../../components/Section';
import { td, th } from '../../components/FormControls';
import { useRedemptions } from '../model/queries';

const userLink =
  'text-brand inline-flex min-h-11 items-center focus-visible:outline-focus underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2';

function User({ r }: { r: VoucherRedemptionDto }) {
  return (
    <Link
      to="/admin/users/$userId"
      params={{ userId: r.userId }}
      className={userLink}
    >
      {r.userEmail ? (
        <bdi dir="ltr">{r.userEmail}</bdi>
      ) : (
        <bdi dir="ltr">{r.userId.slice(0, 8)}</bdi>
      )}
    </Link>
  );
}

/** Who used the code (newest first), paged with `cursor`. */
export function Redemptions({ voucherId }: { voucherId: string }) {
  const { t, i18n } = useTranslation();
  const list = useRedemptions(voucherId);
  const when = (iso: string) =>
    formatActivityDate(iso, i18n.language, {
      today: t('balance.activity.today'),
      yesterday: t('balance.activity.yesterday'),
    });
  const credited = (r: VoucherRedemptionDto) =>
    r.creditedUsd ? <Money value={r.creditedUsd} /> : t('admin.common.none');
  const subscription = (r: VoucherRedemptionDto) =>
    r.subscriptionId ? (
      <ShortId value={r.subscriptionId} />
    ) : (
      t('admin.common.none')
    );

  return (
    <Section title={t('admin.vouchers.redemptions')}>
      {list.isPending ? (
        <p role="status" className="text-fg-muted p-6 text-center">
          {t('admin.common.loading')}
        </p>
      ) : !list.data ? (
        <RetryAlert onRetry={() => void list.refetch()}>
          {t('admin.vouchers.redemptionsError')}
        </RetryAlert>
      ) : list.items.length === 0 ? (
        <p className="text-fg-muted py-6 text-center">
          {t('admin.vouchers.redemptionsEmpty')}
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table
              aria-label={t('admin.vouchers.redemptions')}
              className="w-full min-w-[640px] border-collapse"
            >
              <thead className="bg-surface-muted">
                <tr>
                  {(['user', 'date', 'credited', 'subscription'] as const).map(
                    (c) => (
                      <th key={c} scope="col" className={th}>
                        {t(`admin.vouchers.redemptionColumns.${c}`)}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-border-subtle divide-y">
                {list.items.map((r) => (
                  <tr key={r.id}>
                    <td className={td}>
                      <User r={r} />
                    </td>
                    <td className={td}>{when(r.redeemedAt)}</td>
                    <td className={td}>{credited(r)}</td>
                    <td className={td}>{subscription(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-border-subtle divide-y md:hidden">
            {list.items.map((r) => (
              <li key={r.id} className="grid gap-1 py-3 text-sm">
                <User r={r} />
                <span className="text-fg-muted">{when(r.redeemedAt)}</span>
                <span>
                  {t('admin.vouchers.redemptionColumns.credited')}:{' '}
                  {credited(r)}
                </span>
                {r.subscriptionId ? (
                  <span>
                    {t('admin.vouchers.redemptionColumns.subscription')}:{' '}
                    {subscription(r)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          {list.isError ? (
            <RetryAlert onRetry={() => void list.fetchNextPage()}>
              {t('admin.vouchers.loadMoreError')}
            </RetryAlert>
          ) : null}
          {list.hasNextPage ? (
            <div className="flex justify-center">
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
    </Section>
  );
}
