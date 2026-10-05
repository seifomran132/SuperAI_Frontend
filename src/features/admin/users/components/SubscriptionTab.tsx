import { useState } from 'react';
import { Ban, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminUserDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { formatDate } from '~/lib/dates';
import { EmptyNote, Section } from '../../components/Section';
import { Badge } from '../../components/Badge';
import { planName, subscriptionStatusKey, userLabel } from '../model/labels';
import { useSubscriptions } from '../model/queries';
import { ActivatePlanDialog, EndPlanDialog } from './SubscriptionDialogs';

const th = 'text-fg-muted px-4 py-3 text-start text-sm font-medium';
const td = 'px-4 py-3 text-sm';

export function SubscriptionTab({
  user,
  openActivate,
  onActionHandled,
}: {
  user: AdminUserDto;
  /** Arrived from a row shortcut: open «تفعيل باقة» right away. */
  openActivate: boolean;
  onActionHandled: () => void;
}) {
  const { t, i18n } = useTranslation();
  const history = useSubscriptions(user.id);
  const [dialog, setDialog] = useState<'activate' | 'end' | null>(
    openActivate ? 'activate' : null,
  );
  const items = history.data ?? [];
  const current = items.find((s) => s.status === 'active');
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

  return (
    <div className="grid gap-6">
      {history.isPending ? (
        <p role="status" className="text-fg-muted p-6 text-center">
          {t('admin.common.loading')}
        </p>
      ) : history.isError ? (
        <RetryAlert onRetry={() => void history.refetch()}>
          {t('admin.subscription.error')}
        </RetryAlert>
      ) : null}

      <Section
        title={t('admin.subscription.current')}
        actions={
          <>
            <Button type="button" onClick={() => setDialog('activate')}>
              <Plus aria-hidden="true" />
              {t('admin.subscription.activate')}
            </Button>
            {current ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDialog('end')}
              >
                <Ban aria-hidden="true" />
                {t('admin.subscription.end')}
              </Button>
            ) : null}
          </>
        }
      >
        {current ? (
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-1">
              <dt className="text-fg-muted text-sm">
                {t('admin.subscription.columns.plan')}
              </dt>
              <dd className="text-fg text-lg font-semibold">
                {planName(current, i18n.language)}
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-fg-muted text-sm">
                {t('admin.subscription.periodEnd')}
              </dt>
              <dd className="text-fg text-base">
                {current.currentPeriodEnd
                  ? formatDate(current.currentPeriodEnd, i18n.language)
                  : t('admin.subscription.noEnd')}
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-fg-muted text-sm">
                {t('admin.subscription.included')}
              </dt>
              <dd className="text-fg text-base">
                <Money value={current.includedBalanceUsd} />
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-fg-muted text-sm">
                {t('admin.subscription.price')}
              </dt>
              <dd className="text-fg text-base">
                <Money value={current.priceUsd} />
              </dd>
            </div>
          </dl>
        ) : history.isSuccess ? (
          <div>
            <p className="text-fg text-base font-semibold">
              {t('admin.subscription.none')}
            </p>
            <p className="text-fg-muted text-sm">
              {t('admin.subscription.noneBody')}
            </p>
          </div>
        ) : null}
      </Section>

      <Section title={t('admin.subscription.history')}>
        {history.isSuccess && items.length === 0 ? (
          <EmptyNote
            title={t('admin.subscription.historyEmptyTitle')}
            body={t('admin.subscription.historyEmptyBody')}
          />
        ) : items.length > 0 ? (
          <div
            role="region"
            tabIndex={0}
            aria-label={t('admin.subscription.history')}
            className="focus-visible:outline-focus relative -mx-5 -mb-5 overflow-x-auto outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2"
          >
            <table
              aria-label={t('admin.subscription.history')}
              className="w-full min-w-[720px] border-collapse"
            >
              <thead className="bg-surface-muted">
                <tr>
                  {(
                    [
                      'plan',
                      'status',
                      'source',
                      'started',
                      'end',
                      'included',
                    ] as const
                  ).map((key) => (
                    <th key={key} scope="col" className={th}>
                      {t(`admin.subscription.columns.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((sub) => {
                  const status = subscriptionStatusKey(sub);
                  return (
                    <tr key={sub.id} className="border-border-subtle border-t">
                      <td className={`${td} text-fg font-medium`}>
                        {planName(sub, i18n.language)}
                      </td>
                      <td className={td}>
                        <Badge
                          tone={status === 'active' ? 'success' : 'neutral'}
                          Icon={status === 'active' ? Plus : Ban}
                        >
                          {t(`admin.subscription.status.${status}`)}
                        </Badge>
                      </td>
                      <td className={td}>
                        {t(`admin.subscription.source.${sub.source}`)}
                      </td>
                      <td className={td}>
                        {formatDate(sub.startedAt, i18n.language)}
                      </td>
                      <td className={td}>
                        {sub.endedAt || sub.currentPeriodEnd
                          ? formatDate(
                              (sub.endedAt ?? sub.currentPeriodEnd)!,
                              i18n.language,
                            )
                          : '-'}
                      </td>
                      <td className={td}>
                        <Money value={sub.includedBalanceUsd} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </Section>

      {dialog === 'activate' ? <ActivatePlanDialog {...dialogProps} /> : null}
      {dialog === 'end' ? <EndPlanDialog {...dialogProps} /> : null}
    </div>
  );
}
