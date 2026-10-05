import { Ban, Check, CircleAlert, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminUserDto } from '~/api/generated/types.gen';
import { Badge } from '../../components/Badge';

const status = {
  active: { tone: 'success', Icon: Check },
  suspended: { tone: 'warning', Icon: Ban },
  deleted: { tone: 'danger', Icon: CircleAlert },
} as const;

export function StatusBadge({
  value,
}: {
  value: AdminUserDto['accountStatus'];
}) {
  const { t } = useTranslation();
  const { tone, Icon } = status[value];
  return (
    <Badge tone={tone} Icon={Icon}>
      {t(`admin.users.status.${value}`)}
    </Badge>
  );
}

export function AdminBadge() {
  const { t } = useTranslation();
  return (
    <Badge tone="info" Icon={Shield}>
      {t('admin.users.role.admin')}
    </Badge>
  );
}
