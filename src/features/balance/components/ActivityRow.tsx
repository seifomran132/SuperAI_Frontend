import { useTranslation } from 'react-i18next';
import type { ActivityEntryDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { formatActivityDate } from '~/lib/dates';
import { toDecimal } from '~/lib/money';
import { cn } from '~/lib/utils';
import { activityTypes } from '../model/activity-types';

/**
 * One ledger entry. Credits are green, debits neutral (the sign and the label
 * carry the meaning, not the colour). Phones show amount and date only; the
 * balance after the entry joins from the sm breakpoint.
 */
export function ActivityRow({ entry }: { entry: ActivityEntryDto }) {
  const { t, i18n } = useTranslation();
  const { labelKey, Icon } = activityTypes[entry.type];
  const credit = toDecimal(entry.amountUsd).isPositive();
  const date = formatActivityDate(entry.createdAt, i18n.language, {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  });
  return (
    <li className="flex min-h-16 items-center gap-3 px-4 py-3">
      <span
        aria-hidden="true"
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          credit
            ? 'bg-success-container text-success'
            : 'bg-surface-muted text-fg-muted',
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-fg text-base font-medium">{t(labelKey)}</p>
        <p className="text-fg-muted text-sm">{date}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-end">
        <span
          className={cn(
            'text-base font-semibold',
            credit ? 'text-success' : 'text-fg',
          )}
        >
          <Money value={entry.amountUsd} signed />
        </span>
        <span className="text-fg-muted hidden text-sm sm:block">
          {t('balance.activity.balanceAfter')}{' '}
          <Money value={entry.balanceAfterUsd} />
        </span>
      </div>
    </li>
  );
}
