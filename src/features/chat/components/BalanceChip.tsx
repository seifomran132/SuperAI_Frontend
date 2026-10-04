import { useTranslation } from 'react-i18next';
import { Money } from '~/components/Money';
import { useBalance } from '../model/useChatQueries';

/** «الرصيد 14.48$» in the header; nothing when the balance could not be read. */
export function BalanceChip() {
  const { t } = useTranslation();
  const { balanceUsd, isPending } = useBalance();
  if (isPending) {
    return (
      <span
        role="status"
        aria-label={t('common.loading')}
        className="bg-surface-muted h-8 w-24 animate-pulse rounded-full"
      />
    );
  }
  if (balanceUsd === undefined) return null;
  return (
    <span
      data-slot="balance-chip"
      className="bg-surface-muted text-fg-muted inline-flex h-8 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-sm whitespace-nowrap"
    >
      {t('chat.balanceChip')}
      <span className="text-fg font-semibold">
        <Money value={balanceUsd} />
      </span>
    </span>
  );
}
