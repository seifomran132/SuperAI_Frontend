import { useTranslation } from 'react-i18next';
import { PageScroll } from '~/components/PageScroll';
import { PasswordCard } from '../components/PasswordCard';
import { PlanCard } from '../components/PlanCard';
import { ProfileCard } from '../components/ProfileCard';
import { SessionCard } from '../components/SessionCard';

/** Two columns from lg (profile + session first, so first in the DOM = right), stacked below. */
export function AccountPage() {
  const { t } = useTranslation();
  return (
    <PageScroll>
      <h1 className="text-fg text-3xl font-bold">{t('account.title')}</h1>
      {/* DOM order is the mobile order (sign-out last); from lg the grid places profile + session in the first column, plan + password in the second. */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="lg:col-start-1 lg:row-start-1">
          <ProfileCard />
        </div>
        <div className="lg:col-start-2 lg:row-start-1">
          <PlanCard />
        </div>
        <div className="lg:col-start-2 lg:row-start-2">
          <PasswordCard />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <SessionCard />
        </div>
      </div>
    </PageScroll>
  );
}
