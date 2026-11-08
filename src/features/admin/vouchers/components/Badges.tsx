import {
  Check,
  CircleOff,
  Clock,
  Gift,
  Hourglass,
  PackageCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge, type BadgeTone } from '../../components/Badge';
import type { VoucherStatus } from '../model/status';

const statuses: Record<VoucherStatus, { tone: BadgeTone; Icon: LucideIcon }> = {
  active: { tone: 'success', Icon: Check },
  notStarted: { tone: 'info', Icon: Clock },
  expired: { tone: 'warning', Icon: Hourglass },
  usedUp: { tone: 'warning', Icon: PackageCheck },
  inactive: { tone: 'neutral', Icon: CircleOff },
};

export function StatusBadge({ status }: { status: VoucherStatus }) {
  const { t } = useTranslation();
  const { tone, Icon } = statuses[status];
  return (
    <Badge tone={tone} Icon={Icon}>
      {t(`admin.vouchers.status.${status}`)}
    </Badge>
  );
}

export function KindBadge({ kind }: { kind: 'balance' | 'trial' }) {
  const { t } = useTranslation();
  return (
    <Badge
      tone={kind === 'trial' ? 'info' : 'neutral'}
      Icon={kind === 'trial' ? Gift : Wallet}
    >
      {t(`admin.vouchers.kind.${kind}`)}
    </Badge>
  );
}
