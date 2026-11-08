import { Link } from '@tanstack/react-router';
import { BarChart3, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageScroll } from '~/components/PageScroll';
import { ActivityList } from '../components/ActivityList';
import { BalanceCard } from '../components/BalanceCard';
import { RedeemCodeBox } from '../components/RedeemCodeBox';

export function BalancePage() {
  const { t } = useTranslation();
  return (
    <PageScroll>
      <h1 className="text-fg text-3xl font-bold">{t('balance.title')}</h1>
      <BalanceCard />
      <Link
        to="/usage"
        className="text-brand focus-visible:outline-focus flex min-h-11 items-center gap-2 self-start rounded-md text-sm font-medium outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <BarChart3 aria-hidden className="size-5" />
        {t('balance.viewUsage')}
        <ChevronLeft aria-hidden className="size-4 ltr:rotate-180" />
      </Link>
      <RedeemCodeBox />
      <ActivityList />
    </PageScroll>
  );
}
