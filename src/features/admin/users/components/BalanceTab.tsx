import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  AdminLedgerEntryDto,
  AdminUserDto,
} from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { formatActivityDate } from '~/lib/dates';
import { toDecimal } from '~/lib/money';
import { cn } from '~/lib/utils';
import { EmptyNote, Section } from '../../components/Section';
import { ShortId } from '../../components/ShortId';
import { userLabel } from '../model/labels';
import { useLedger, useUserBalance } from '../model/queries';
import { AdjustDialog, PurchaseDialog } from './BalanceDialogs';

const th = 'text-fg-muted px-4 py-3 text-start text-sm font-medium';
const td = 'px-4 py-3 text-sm';

function Stat({
  label,
  value,
  primary,
}: {
  label: string;
  value: string | undefined;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-surface rounded-lg border p-5',
        primary ? 'border-brand border-2' : 'border-border-subtle',
      )}
    >
      <p className="text-fg-muted text-sm">{label}</p>
      <p className="text-fg mt-2 text-3xl font-bold">
        {value === undefined ? '…' : <Money value={value} />}
      </p>
    </div>
  );
}

function ActorCell({ entry }: { entry: AdminLedgerEntryDto }) {
  const { t } = useTranslation();
  const label = t(`admin.balance.actor.${entry.actorType}`);
  return (
    <>
      {label}
      {entry.actorType === 'admin' && entry.actorId ? (
        <>
          {': '}
          <ShortId value={entry.actorId} />
        </>
      ) : null}
    </>
  );
}

export function BalanceTab({
  user,
  openAdjust,
  onActionHandled,
}: {
  user: AdminUserDto;
  /** Arrived from the «إضافة رصيد» row shortcut. */
  openAdjust: boolean;
  onActionHandled: () => void;
}) {
  const { t, i18n } = useTranslation();
  const balance = useUserBalance(user.id);
  const ledger = useLedger(user.id);
  const [dialog, setDialog] = useState<'adjust' | 'payment' | null>(
    openAdjust ? 'adjust' : null,
  );
  const dialogProps = {
    userId: user.id,
    userName: userLabel(user, t('admin.users.unnamed')),
    open: dialog !== null,
    onOpenChange: (open: boolean) => {
      if (open) return;
      setDialog(null);
      onActionHandled();
    },
  };
  const labels = {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  };

  return (
    <div className="grid gap-6">
      {balance.isError ? (
        <RetryAlert onRetry={() => void balance.refetch()}>
          {t('admin.balance.error')}
        </RetryAlert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          primary
          label={t('admin.balance.available')}
          value={balance.data?.spendableUsd}
        />
        <Stat
          label={t('admin.balance.total')}
          value={balance.data?.balanceUsd}
        />
        <Stat
          label={t('admin.balance.reserved')}
          value={balance.data?.reservedUsd}
        />
      </div>

      <Section
        title={t('admin.balance.ledger')}
        actions={
          <>
            <Button type="button" onClick={() => setDialog('adjust')}>
              <Plus aria-hidden="true" />
              {t('admin.balance.adjust')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialog('payment')}
            >
              <Wallet aria-hidden="true" />
              {t('admin.balance.recordPayment')}
            </Button>
          </>
        }
      >
        {ledger.isPending ? (
          <p role="status" className="text-fg-muted p-6 text-center">
            {t('admin.common.loading')}
          </p>
        ) : ledger.isError && ledger.entries.length === 0 ? (
          <RetryAlert onRetry={() => void ledger.refetch()}>
            {t('admin.balance.ledgerError')}
          </RetryAlert>
        ) : ledger.entries.length === 0 ? (
          <EmptyNote
            title={t('admin.balance.ledgerEmptyTitle')}
            body={t('admin.balance.ledgerEmptyBody')}
          />
        ) : (
          <div className="-mx-5 -mb-5">
            <div className="overflow-x-auto">
              <table
                aria-label={t('admin.balance.ledger')}
                className="w-full min-w-[900px] border-collapse"
              >
                <thead className="bg-surface-muted">
                  <tr>
                    {(
                      [
                        'type',
                        'amount',
                        'after',
                        'actor',
                        'reason',
                        'reference',
                        'date',
                      ] as const
                    ).map((key) => (
                      <th key={key} scope="col" className={th}>
                        {t(`admin.balance.columns.${key}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ledger.entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-border-subtle border-t"
                    >
                      <td
                        className={`${td} text-fg font-medium whitespace-nowrap`}
                      >
                        {t(`admin.balance.types.${entry.type}`)}
                      </td>
                      <td
                        className={cn(
                          td,
                          'font-semibold',
                          toDecimal(entry.amountUsd).isPositive()
                            ? 'text-success'
                            : 'text-fg',
                        )}
                      >
                        <Money value={entry.amountUsd} kind="cost" signed />
                      </td>
                      <td className={td}>
                        <Money value={entry.balanceAfterUsd} />
                      </td>
                      <td className={td}>
                        <ActorCell entry={entry} />
                      </td>
                      <td className={`${td} text-fg-muted`}>
                        {entry.reason ?? '-'}
                      </td>
                      <td className={`${td} text-fg-muted`}>
                        {entry.referenceId ? (
                          <ShortId value={entry.referenceId} />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className={`${td} text-fg-muted whitespace-nowrap`}>
                        {formatActivityDate(
                          entry.createdAt,
                          i18n.language,
                          labels,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ledger.isError ? (
              <div className="p-4">
                <RetryAlert onRetry={() => void ledger.fetchNextPage()}>
                  {t('admin.balance.loadMoreError')}
                </RetryAlert>
              </div>
            ) : null}
            {ledger.hasNextPage ? (
              <div className="border-border-subtle flex justify-center border-t p-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={ledger.isFetchingNextPage}
                  onClick={() => void ledger.fetchNextPage()}
                >
                  {t('admin.balance.loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Section>

      {dialog === 'adjust' ? <AdjustDialog {...dialogProps} /> : null}
      {dialog === 'payment' ? <PurchaseDialog {...dialogProps} /> : null}
    </div>
  );
}
