import {
  CalendarCheck,
  Hourglass,
  MessageSquare,
  SlidersHorizontal,
  Ticket,
  Undo2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityEntryDto } from '~/api/generated/types.gen';

export type ActivityType = ActivityEntryDto['type'];

/** Label key (`balance.activity.types.*`) and icon per entry type. */
export const activityTypes: Record<
  ActivityType,
  { labelKey: string; Icon: LucideIcon }
> = {
  subscription_credit: {
    labelKey: 'balance.activity.types.subscription_credit',
    Icon: CalendarCheck,
  },
  purchase: { labelKey: 'balance.activity.types.purchase', Icon: Wallet },
  usage_charge: {
    labelKey: 'balance.activity.types.usage_charge',
    Icon: MessageSquare,
  },
  voucher_credit: {
    labelKey: 'balance.activity.types.voucher_credit',
    Icon: Ticket,
  },
  refund: { labelKey: 'balance.activity.types.refund', Icon: Undo2 },
  adjustment: {
    labelKey: 'balance.activity.types.adjustment',
    Icon: SlidersHorizontal,
  },
  expiry: { labelKey: 'balance.activity.types.expiry', Icon: Hourglass },
};
