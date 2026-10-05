import { useState } from 'react';
import { ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminUserDto } from '~/api/generated/types.gen';
import { Button } from '~/components/ui/button';
import { formatActivityDate, formatDate } from '~/lib/dates';
import { Section } from '../../components/Section';
import { userLabel } from '../model/labels';
import { AdminRoleDialog, StatusDialog } from './AccountDialogs';
import { AdminBadge, StatusBadge } from './UserBadges';

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-fg-muted text-sm">{label}</dt>
      <dd className="text-fg text-base">{children}</dd>
    </div>
  );
}

/** Profile facts plus suspend/reactivate and grant/remove admin. */
export function OverviewTab({ user }: { user: AdminUserDto }) {
  const { t, i18n } = useTranslation();
  const [dialog, setDialog] = useState<'status' | 'role' | null>(null);
  const suspended = user.accountStatus === 'suspended';
  const deleted = user.accountStatus === 'deleted';
  const common = {
    userId: user.id,
    userName: userLabel(user, t('admin.users.unnamed')),
    open: dialog !== null,
    onOpenChange: (open: boolean) => !open && setDialog(null),
  };
  return (
    <div className="grid gap-6">
      <Section title={t('admin.overview.facts')}>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label={t('admin.overview.email')}>
            <bdi dir="ltr">{user.email ?? '-'}</bdi>
          </Fact>
          <Fact label={t('admin.overview.name')}>
            {user.fullName ?? t('admin.users.unnamed')}
          </Fact>
          <Fact label={t('admin.overview.phone')}>
            {user.phoneNumber ? <bdi dir="ltr">{user.phoneNumber}</bdi> : '-'}
          </Fact>
          <Fact label={t('admin.overview.status')}>
            <StatusBadge value={user.accountStatus} />
          </Fact>
          <Fact label={t('admin.overview.role')}>
            {user.isAdmin ? <AdminBadge /> : t('admin.users.role.user')}
          </Fact>
          <Fact label={t('admin.overview.createdAt')}>
            {formatDate(user.createdAt, i18n.language)}
          </Fact>
          <Fact label={t('admin.overview.lastSignIn')}>
            {user.lastSignInAt
              ? formatActivityDate(user.lastSignInAt, i18n.language, {
                  today: t('balance.activity.today'),
                  yesterday: t('balance.activity.yesterday'),
                })
              : t('admin.users.neverSignedIn')}
          </Fact>
          <Fact label={t('admin.overview.userId')}>
            <bdi dir="ltr" className="text-sm break-all">
              {user.id}
            </bdi>
          </Fact>
        </dl>
      </Section>

      {deleted ? null : (
        <Section title={t('admin.overview.actions')}>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={suspended ? 'primary' : 'secondary'}
              onClick={() => setDialog('status')}
            >
              {suspended ? (
                <UserCheck aria-hidden="true" />
              ) : (
                <UserX aria-hidden="true" />
              )}
              {t(
                suspended
                  ? 'admin.overview.reactivate'
                  : 'admin.overview.suspend',
              )}
            </Button>
            <RoleButton
              isAdmin={user.isAdmin}
              onClick={() => setDialog('role')}
            />
          </div>
        </Section>
      )}

      {dialog === 'status' ? (
        <StatusDialog {...common} target={suspended ? 'active' : 'suspended'} />
      ) : null}
      {dialog === 'role' ? (
        <AdminRoleDialog {...common} grant={!user.isAdmin} />
      ) : null}
    </div>
  );
}

function RoleButton({
  isAdmin,
  onClick,
}: {
  isAdmin: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button type="button" variant="secondary" onClick={onClick}>
      {isAdmin ? (
        <ShieldOff aria-hidden="true" />
      ) : (
        <ShieldCheck aria-hidden="true" />
      )}
      {t(isAdmin ? 'admin.overview.removeAdmin' : 'admin.overview.grantAdmin')}
    </Button>
  );
}
