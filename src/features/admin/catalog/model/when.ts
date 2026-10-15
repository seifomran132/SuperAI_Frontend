import { useTranslation } from 'react-i18next';
import { formatActivityDate } from '~/lib/dates';

/** ISO instant → «اليوم 06:00» / «2 أكتوبر 2026 · 18:30» in the current language. */
export function useWhen() {
  const { t, i18n } = useTranslation();
  const labels = {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  };
  return (iso: string) => formatActivityDate(iso, i18n.language, labels);
}
