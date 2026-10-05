import { Link } from '@tanstack/react-router';
import { CreditCard, ExternalLink, MoreVertical, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminUserDto } from '~/api/generated/types.gen';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { formatActivityDate, formatDate } from '~/lib/dates';
import { AdminBadge, StatusBadge } from './UserBadges';

function RowMenu({ user }: { user: AdminUserDto }) {
  const { t } = useTranslation();
  const label = user.email ?? user.fullName ?? user.id;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${t('admin.users.rowActions')}: ${label}`}
        >
          <MoreVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            to="/admin/users/$userId"
            params={{ userId: user.id }}
            search={{ tab: 'overview' }}
          >
            <ExternalLink aria-hidden="true" className="text-fg-muted size-5" />
            {t('admin.users.open')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/admin/users/$userId"
            params={{ userId: user.id }}
            search={{ tab: 'subscription', action: 'activate-plan' }}
          >
            <CreditCard aria-hidden="true" className="text-fg-muted size-5" />
            {t('admin.users.activatePlan')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/admin/users/$userId"
            params={{ userId: user.id }}
            search={{ tab: 'balance', action: 'add-funds' }}
          >
            <Wallet aria-hidden="true" className="text-fg-muted size-5" />
            {t('admin.users.addFunds')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const th = 'text-fg-muted px-4 py-3 text-start text-sm font-medium';
const td = 'px-4 py-3 text-sm';

/** Dense users table. Rows are links to the user through the first column. */
export function UsersTable({ users }: { users: AdminUserDto[] }) {
  const { t, i18n } = useTranslation();
  const labels = {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  };
  return (
    <div className="relative overflow-x-auto">
      <table
        aria-label={t('admin.users.tableLabel')}
        className="w-full min-w-[880px] border-collapse"
      >
        <thead className="bg-surface-muted">
          <tr>
            <th scope="col" className={th}>
              {t('admin.users.columns.email')}
            </th>
            <th scope="col" className={th}>
              {t('admin.users.columns.name')}
            </th>
            <th scope="col" className={th}>
              {t('admin.users.columns.status')}
            </th>
            <th scope="col" className={th}>
              {t('admin.users.columns.role')}
            </th>
            <th scope="col" className={th}>
              {t('admin.users.columns.lastSignIn')}
            </th>
            <th scope="col" className={th}>
              {t('admin.users.columns.createdAt')}
            </th>
            <th scope="col" className={th}>
              <span className="sr-only">
                {t('admin.users.columns.actions')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-border-subtle border-t">
              <td className={td}>
                <Link
                  to="/admin/users/$userId"
                  params={{ userId: user.id }}
                  search={{ tab: 'overview' }}
                  className="text-fg focus-visible:outline-focus rounded-sm underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <bdi dir="ltr">{user.email ?? user.id}</bdi>
                </Link>
              </td>
              <td className={td}>
                {user.fullName ?? t('admin.users.unnamed')}
              </td>
              <td className={td}>
                <StatusBadge value={user.accountStatus} />
              </td>
              <td className={td}>{user.isAdmin ? <AdminBadge /> : '-'}</td>
              <td className={`${td} text-fg-muted`}>
                {user.lastSignInAt
                  ? formatActivityDate(user.lastSignInAt, i18n.language, labels)
                  : t('admin.users.neverSignedIn')}
              </td>
              <td className={`${td} text-fg-muted`}>
                {formatDate(user.createdAt, i18n.language)}
              </td>
              <td className="px-2 py-1">
                <RowMenu user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
