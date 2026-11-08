import { useTranslation } from 'react-i18next';
import type { VoucherDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { formatDate } from '~/lib/dates';

/** «5.00$» for balance codes, «احترافي · 7 أيام» for trials. */
export function VoucherValue({ voucher }: { voucher: VoucherDto }) {
  const { t, i18n } = useTranslation();
  if (voucher.kind === 'balance') {
    return voucher.amountUsd ? <Money value={voucher.amountUsd} /> : <>-</>;
  }
  const plan = voucher.plan
    ? i18n.language === 'en'
      ? voucher.plan.nameEn
      : voucher.plan.nameAr
    : voucher.plan;
  return (
    <>
      {t('admin.vouchers.trialValue', {
        plan: plan ?? '-',
        days: t('admin.vouchers.days', { count: voucher.trialDays ?? 0 }),
      })}
    </>
  );
}

/** Start and end of the redeem window, or «بلا نهاية». */
export function VoucherWindow({ voucher }: { voucher: VoucherDto }) {
  const { t, i18n } = useTranslation();
  return (
    <>
      {voucher.startsAt ? (
        <span className="block">
          {t('admin.vouchers.windowFrom', {
            date: formatDate(voucher.startsAt, i18n.language),
          })}
        </span>
      ) : null}
      <span className="block">
        {voucher.endsAt
          ? t('admin.vouchers.windowTo', {
              date: formatDate(voucher.endsAt, i18n.language),
            })
          : t('admin.vouchers.noEnd')}
      </span>
    </>
  );
}
