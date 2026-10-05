import { useTranslation } from 'react-i18next';
import { PageScroll } from '~/components/PageScroll';
import { ActivityList } from '../components/ActivityList';
import { BalanceCard } from '../components/BalanceCard';

export function BalancePage() {
  const { t } = useTranslation();
  return (
    <PageScroll>
      <h1 className="text-fg text-3xl font-bold">{t('balance.title')}</h1>
      <BalanceCard />
      <ActivityList />
    </PageScroll>
  );
}
