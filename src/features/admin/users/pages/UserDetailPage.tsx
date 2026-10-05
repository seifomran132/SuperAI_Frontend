import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router';
import { ChevronRight, MailCheck, MailWarning } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { RetryAlert } from '~/components/RetryAlert';
import { Badge } from '../../components/Badge';
import { BalanceTab } from '../components/BalanceTab';
import { OverviewTab } from '../components/OverviewTab';
import { SubscriptionTab } from '../components/SubscriptionTab';
import { StatusBadge } from '../components/UserBadges';
import { userLabel } from '../model/labels';
import { useUser } from '../model/queries';
import { USER_TABS, validateUserDetailSearch } from '../model/search';

/** A2: header and the Overview / Subscription / Balance tabs (`?tab=`). */
export function UserDetailPage() {
  const { t } = useTranslation();
  const { userId } = useParams({ strict: false }) as { userId: string };
  const { tab = 'overview', action } = validateUserDetailSearch(
    useSearch({ strict: false }),
  );
  const navigate = useNavigate();
  const query = useUser(userId);

  if (query.isPending) {
    return (
      <p role="status" className="text-fg-muted p-10 text-center">
        {t('admin.common.loading')}
      </p>
    );
  }
  if (query.isError) {
    const notFound =
      isApiError(query.error) && query.error.code === 'USER_NOT_FOUND';
    if (notFound) {
      return (
        <div className="bg-surface border-border-subtle grid justify-items-center gap-3 rounded-lg border p-10 text-center">
          <h2 className="text-fg text-xl font-bold">
            {t('admin.detail.notFoundTitle')}
          </h2>
          <p className="text-fg-muted">{t(errorMessageKey(query.error))}</p>
          <Link
            to="/admin/users"
            className="text-brand inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
          >
            {t('admin.detail.backToUsers')}
          </Link>
        </div>
      );
    }
    return (
      <RetryAlert onRetry={() => void query.refetch()}>
        {t('admin.detail.error')}
      </RetryAlert>
    );
  }

  const user = query.data;
  const name = userLabel(user, t('admin.users.unnamed'));
  // Only a shortcut link leaves an `action` in the URL; opening a dialog by button does not.
  const clearAction = () =>
    action &&
    void navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        action: undefined,
      }),
      replace: true,
    });

  return (
    <>
      <div className="grid gap-3">
        <nav aria-label={t('admin.detail.breadcrumb')}>
          <ol className="text-fg-muted flex items-center gap-2 text-sm">
            <li>
              <Link
                to="/admin/users"
                className="hover:text-fg inline-flex min-h-11 items-center hover:underline"
              >
                {t('admin.nav.users')}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-4 rtl:-scale-x-100" />
            </li>
            <li aria-current="page" className="text-fg">
              {name}
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-fg min-w-0 text-3xl font-bold wrap-anywhere">
            {name}
          </h2>
          {user.email ? (
            <bdi dir="ltr" className="text-fg-muted text-base break-all">
              {user.email}
            </bdi>
          ) : null}
          <StatusBadge value={user.accountStatus} />
          <Badge
            tone={user.emailConfirmedAt ? 'neutral' : 'warning'}
            Icon={user.emailConfirmedAt ? MailCheck : MailWarning}
          >
            {t(
              user.emailConfirmedAt
                ? 'admin.detail.emailConfirmed'
                : 'admin.detail.emailUnconfirmed',
            )}
          </Badge>
        </div>
      </div>

      <nav
        aria-label={t('admin.detail.tabsLabel')}
        className="border-border-subtle flex gap-2 border-b"
      >
        {USER_TABS.map((key) => (
          <Link
            key={key}
            to="/admin/users/$userId"
            params={{ userId }}
            search={{ tab: key }}
            replace
            aria-current={tab === key ? 'page' : undefined}
            className={
              tab === key
                ? 'border-brand text-fg focus-visible:outline-focus flex min-h-11 items-center border-b-2 px-4 font-semibold outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2'
                : 'text-fg-muted hover:text-fg focus-visible:outline-focus flex min-h-11 items-center border-b-2 border-transparent px-4 outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2'
            }
          >
            {t(`admin.detail.tabs.${key}`)}
          </Link>
        ))}
      </nav>

      {tab === 'overview' ? <OverviewTab user={user} /> : null}
      {tab === 'subscription' ? (
        <SubscriptionTab
          user={user}
          openActivate={action === 'activate-plan'}
          onActionHandled={clearAction}
        />
      ) : null}
      {tab === 'balance' ? (
        <BalanceTab
          user={user}
          openAdjust={action === 'add-funds'}
          onActionHandled={clearAction}
        />
      ) : null}
    </>
  );
}
