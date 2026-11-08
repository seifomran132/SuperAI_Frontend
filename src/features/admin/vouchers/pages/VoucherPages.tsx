import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { adminVouchersUpdateMutation } from '~/api/generated/@tanstack/react-query.gen';
import type { VoucherDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { formatActivityDate } from '~/lib/dates';
import {
  BackLink,
  NotFoundCard,
  QueryState,
} from '../../catalog/components/CatalogParts';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { ShortId } from '../../components/ShortId';
import { StatusBadge, KindBadge } from '../components/Badges';
import { CodeResult } from '../components/CodeResult';
import { CreateForm } from '../components/CreateForm';
import { Redemptions } from '../components/Redemptions';
import { SettingsForm } from '../components/SettingsForm';
import { VoucherValue } from '../components/VoucherValue';
import { invalidateVouchers, useVoucher } from '../model/queries';
import { voucherStatus } from '../model/status';

/** S22 frames 2-3: the form, then the result view with the new code. */
export function VoucherNewPage() {
  const { t } = useTranslation();
  const [created, setCreated] = useState<VoucherDto | null>(null);
  // A new key remounts the form empty for «إنشاء كود آخر».
  const [round, setRound] = useState(0);
  return (
    <>
      <BackLink to="/admin/vouchers" label={t('admin.vouchers.backToList')} />
      {created ? (
        <CodeResult
          voucher={created}
          onAnother={() => {
            setCreated(null);
            setRound((n) => n + 1);
          }}
        />
      ) : (
        <CreateForm key={round} onCreated={setCreated} />
      )}
    </>
  );
}

function Summary({ voucher }: { voucher: VoucherDto }) {
  const { t, i18n } = useTranslation();
  const day = {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  };
  const when = (iso: string) => formatActivityDate(iso, i18n.language, day);
  return (
    <Section title={t('admin.vouchers.summary')}>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Item label={t('admin.vouchers.columns.kind')}>
          <KindBadge kind={voucher.kind} />
        </Item>
        <Item label={t('admin.vouchers.columns.value')}>
          <VoucherValue voucher={voucher} />
        </Item>
        <Item label={t('admin.vouchers.startsAt')}>
          {voucher.startsAt ? when(voucher.startsAt) : when(voucher.createdAt)}
        </Item>
        <Item label={t('admin.vouchers.newUsersOnly')}>
          {t(voucher.newUsersOnly ? 'admin.vouchers.yes' : 'admin.vouchers.no')}
        </Item>
        <Item label={t('admin.vouchers.createdAt')}>
          {when(voucher.createdAt)}
        </Item>
        <Item label={t('admin.vouchers.createdBy')}>
          {voucher.createdBy ? (
            <ShortId value={voucher.createdBy} />
          ) : (
            t('admin.common.none')
          )}
        </Item>
      </dl>
      <p className="text-fg-muted flex items-start gap-2 text-sm">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {t('admin.vouchers.summaryNote')}
      </p>
    </Section>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-fg-muted text-sm">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}

/** «إيقاف الكود» / «تفعيل الكود»: the only way to change `isActive` (decision 17). */
function ToggleButton({ voucher }: { voucher: VoucherDto }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const update = useMutation(adminVouchersUpdateMutation());
  const [open, setOpen] = useState(false);
  const stopping = voucher.isActive;
  const label = t(
    stopping ? 'admin.vouchers.deactivate' : 'admin.vouchers.activate',
  );
  return (
    <>
      <Button
        variant={stopping ? 'danger' : 'primary'}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open ? (
        <ReasonDialog
          open
          onOpenChange={setOpen}
          title={label}
          description={voucher.code}
          submitLabel={label}
          danger={stopping}
          notice={
            <p className="text-fg-muted text-sm">
              {t(
                stopping
                  ? 'admin.vouchers.deactivateBody'
                  : 'admin.vouchers.activateBody',
              )}
            </p>
          }
          onSubmit={async ({ reason }) => {
            await update.mutateAsync({
              path: { id: voucher.id },
              body: { reason, isActive: !stopping },
            });
            await invalidateVouchers(queryClient);
            toast.success(
              t(
                stopping
                  ? 'admin.vouchers.deactivated'
                  : 'admin.vouchers.activated',
              ),
            );
          }}
        />
      ) : null}
    </>
  );
}

/** S22 frame 4: summary, settings, redemptions. */
export function VoucherDetailPage() {
  const { t } = useTranslation();
  const { voucherId } = useParams({ strict: false }) as { voucherId: string };
  const query = useVoucher(voucherId);
  const notFound =
    query.isError &&
    isApiError(query.error) &&
    query.error.code === 'VOUCHER_NOT_FOUND';
  if (notFound) {
    return (
      <NotFoundCard
        title={t('admin.vouchers.notFoundTitle')}
        body={t(errorMessageKey(query.error))}
        to="/admin/vouchers"
        back={t('admin.vouchers.backToList')}
      />
    );
  }
  const voucher = query.data;
  const status = voucher ? voucherStatus(voucher) : null;
  return (
    <>
      <BackLink to="/admin/vouchers" label={t('admin.vouchers.backToList')} />
      <QueryState query={query} error={t('admin.vouchers.detailError')}>
        {voucher && status ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-fg text-xl font-bold">
                  <bdi dir="ltr">{voucher.code}</bdi>
                </h2>
                <StatusBadge status={status} />
              </div>
              <ToggleButton voucher={voucher} />
            </div>
            {status === 'inactive' ? (
              <Alert variant="warning">
                {t('admin.vouchers.inactiveBanner')}
              </Alert>
            ) : status === 'usedUp' ? (
              <Alert variant="warning">
                {t('admin.vouchers.usedUpBanner', {
                  used: voucher.redemptionCount,
                  max: voucher.maxRedemptions,
                })}
              </Alert>
            ) : null}
            <Summary voucher={voucher} />
            {/* Keyed by id only: stopping or activating must not discard unsaved edits. */}
            <SettingsForm key={voucher.id} voucher={voucher} />
            <Redemptions voucherId={voucher.id} />
          </>
        ) : null}
      </QueryState>
    </>
  );
}
