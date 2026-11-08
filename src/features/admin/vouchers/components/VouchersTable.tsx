import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VoucherDto } from '~/api/generated/types.gen';
import { td, th } from '../../components/FormControls';
import { voucherStatus } from '../model/status';
import { KindBadge, StatusBadge } from './Badges';
import { VoucherValue, VoucherWindow } from './VoucherValue';

const codeLink =
  'text-brand inline-flex min-h-11 items-center focus-visible:outline-focus font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2';

function Code({ voucher }: { voucher: VoucherDto }) {
  return (
    <Link
      to="/admin/vouchers/$voucherId"
      params={{ voucherId: voucher.id }}
      className={codeLink}
    >
      <bdi dir="ltr">{voucher.code}</bdi>
    </Link>
  );
}

const Usage = ({ voucher }: { voucher: VoucherDto }) => (
  <bdi dir="ltr" className="tabular-nums">
    {voucher.redemptionCount} / {voucher.maxRedemptions}
  </bdi>
);

const columns = ['code', 'kind', 'value', 'usage', 'period', 'status'] as const;

/** Table from `md`, cards below it (no horizontal page scroll on phones). */
export function VouchersTable({ vouchers }: { vouchers: VoucherDto[] }) {
  const { t } = useTranslation();
  const now = new Date();
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table
          aria-label={t('admin.vouchers.tableLabel')}
          className="w-full min-w-[880px] border-collapse"
        >
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className={th}>
                  {t(`admin.vouchers.columns.${c}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border-subtle divide-y">
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td className={td}>
                  <Code voucher={v} />
                </td>
                <td className={td}>
                  <KindBadge kind={v.kind} />
                </td>
                <td className={td}>
                  <VoucherValue voucher={v} />
                </td>
                <td className={td}>
                  <Usage voucher={v} />
                </td>
                <td className={td}>
                  <VoucherWindow voucher={v} />
                </td>
                <td className={td}>
                  <StatusBadge status={voucherStatus(v, now)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul
        aria-label={t('admin.vouchers.tableLabel')}
        className="divide-border-subtle divide-y md:hidden"
      >
        {vouchers.map((v) => (
          <li key={v.id} className="grid gap-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <Code voucher={v} />
              <ChevronLeft
                aria-hidden="true"
                className="text-fg-subtle size-4 ltr:rotate-180"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={v.kind} />
              <StatusBadge status={voucherStatus(v, now)} />
            </div>
            <dl className="text-fg-muted grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt>{t('admin.vouchers.columns.value')}</dt>
              <dd className="text-fg">
                <VoucherValue voucher={v} />
              </dd>
              <dt>{t('admin.vouchers.columns.usage')}</dt>
              <dd className="text-fg">
                <Usage voucher={v} />
              </dd>
              <dt>{t('admin.vouchers.columns.period')}</dt>
              <dd className="text-fg">
                <VoucherWindow voucher={v} />
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
