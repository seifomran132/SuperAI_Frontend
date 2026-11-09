import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Info, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { adminVoucherBatchesUpdateMutation } from '~/api/generated/@tanstack/react-query.gen';
import type {
  UpdateVoucherBatchDto,
  VoucherBatchDto,
} from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { formatActivityDate } from '~/lib/dates';
import { QueryState } from '../../catalog/components/CatalogParts';
import {
  collect,
  serverFieldErrors,
  type Errors,
} from '../../catalog/model/form';
import { TextAreaField } from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { ShortId } from '../../components/ShortId';
import { KindBadge, StatusBadge } from '../components/Badges';
import { BatchCodes } from '../components/BatchCodes';
import { BatchDownload } from '../components/BatchDownload';
import { BatchForm } from '../components/BatchForm';
import { DateTimeField } from '../components/DateTimeField';
import { ProgressBar } from '../components/ProgressBar';
import { VoucherValue } from '../components/VoucherValue';
import { batchStatus, percentOf, useBatch } from '../model/batches';
import { fromLocalInput, toLocalInput } from '../model/dates';
import { dateError, windowError } from '../model/form';
import { invalidateVouchers } from '../model/queries';

function BackToBatches() {
  const { t } = useTranslation();
  return (
    <Link
      to="/admin/vouchers"
      search={{ tab: 'batches' }}
      className="text-brand focus-visible:outline-focus inline-flex min-h-11 w-fit items-center gap-1 font-semibold outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
    >
      <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      {t('admin.vouchers.batches.backToList')}
    </Link>
  );
}

/** S23 frames 2-3; a new batch opens on its page with the live-codes notice. */
export function BatchNewPage() {
  const navigate = useNavigate();
  return (
    <>
      <BackToBatches />
      <BatchForm
        onCreated={(batch) =>
          void navigate({
            to: '/admin/vouchers/batches/$batchId',
            params: { batchId: batch.id },
            search: { created: true },
            replace: true,
          })
        }
      />
    </>
  );
}

function ToggleBatch({ batch }: { batch: VoucherBatchDto }) {
  const { t } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  const queryClient = useQueryClient();
  const update = useMutation(adminVoucherBatchesUpdateMutation());
  const [open, setOpen] = useState(false);
  const stopping = batch.isActive;
  const label = b(stopping ? 'deactivate' : 'activate');
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
          description={batch.name}
          submitLabel={label}
          danger={stopping}
          notice={
            <p className="text-fg-muted text-sm">
              {b(stopping ? 'deactivateBody' : 'activateBody')}
            </p>
          }
          onSubmit={async ({ reason }) => {
            await update.mutateAsync({
              path: { id: batch.id },
              body: { reason, isActive: !stopping },
            });
            await invalidateVouchers(queryClient);
            toast.success(b(stopping ? 'deactivated' : 'activated'));
          }}
        />
      ) : null}
    </>
  );
}

function Stat({
  label,
  value,
  percent,
}: {
  label: string;
  value: ReactNode;
  percent: number;
}) {
  return (
    <div className="grid content-start gap-1">
      <p className="text-fg-muted text-sm">{label}</p>
      <p className="text-fg text-2xl font-bold tabular-nums">{value}</p>
      <ProgressBar percent={percent} />
    </div>
  );
}

function Progress({ batch }: { batch: VoucherBatchDto }) {
  const { t } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  return (
    <Section title={b('progress')}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Stat
          label={b('codesUsed')}
          value={
            <bdi dir="ltr">
              {batch.redeemedCount} / {batch.quantity}
            </bdi>
          }
          percent={percentOf(batch.redeemedCount, batch.quantity)}
        />
        {batch.totalValueUsd ? (
          <Stat
            label={b('credited')}
            value={
              <>
                <Money value={batch.creditedUsd} />{' '}
                <span className="text-fg-muted text-sm font-normal">
                  {b('of')} <Money value={batch.totalValueUsd} />
                </span>
              </>
            }
            percent={percentOf(batch.creditedUsd, batch.totalValueUsd)}
          />
        ) : null}
      </div>
    </Section>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-fg-muted text-sm">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}

function Summary({ batch }: { batch: VoucherBatchDto }) {
  const { t, i18n } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  const when = (iso: string) =>
    formatActivityDate(iso, i18n.language, {
      today: t('balance.activity.today'),
      yesterday: t('balance.activity.yesterday'),
    });
  return (
    <Section title={b('summary')}>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Item label={t('admin.vouchers.columns.kind')}>
          <KindBadge kind={batch.kind} />
        </Item>
        <Item label={b('valuePerCode')}>
          <VoucherValue voucher={batch} />
        </Item>
        <Item label={b('quantityLabel')}>{batch.quantity}</Item>
        <Item label={b('prefixLabel')}>
          {batch.prefix ? <bdi dir="ltr">{batch.prefix}</bdi> : '-'}
        </Item>
        <Item label={t('admin.vouchers.startsAt')}>
          {when(batch.startsAt ?? batch.createdAt)}
        </Item>
        <Item label={t('admin.vouchers.newUsersOnly')}>
          {t(batch.newUsersOnly ? 'admin.vouchers.yes' : 'admin.vouchers.no')}
        </Item>
        <Item label={t('admin.vouchers.createdAt')}>
          {when(batch.createdAt)}
        </Item>
        <Item label={t('admin.vouchers.createdBy')}>
          {batch.createdBy ? (
            <ShortId value={batch.createdBy} />
          ) : (
            t('admin.common.none')
          )}
        </Item>
      </dl>
      <p className="text-fg-muted flex items-start gap-2 text-sm">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {b('summaryNote')}
      </p>
    </Section>
  );
}

function Settings({ batch }: { batch: VoucherBatchDto }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const update = useMutation(adminVoucherBatchesUpdateMutation());
  const original = {
    endsAt: toLocalInput(batch.endsAt),
    note: batch.note ?? '',
  };
  const [v, setV] = useState(original);
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);
  const err = (field: string) =>
    errors[field] ? t(`admin.${errors[field]}`) : undefined;

  const changes: string[] = [];
  const patch: Omit<UpdateVoucherBatchDto, 'reason'> = {};
  if (v.endsAt !== original.endsAt) {
    patch.endsAt = v.endsAt === '' ? null : fromLocalInput(v.endsAt);
    changes.push(
      t(
        v.endsAt === ''
          ? 'admin.vouchers.changeEndRemoved'
          : 'admin.vouchers.changeEnd',
      ),
    );
  }
  if (v.note.trim() !== original.note) {
    patch.note = v.note.trim() === '' ? null : v.note.trim();
    changes.push(t('admin.vouchers.changeNote'));
  }
  const changed = changes.length > 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = collect({
      endsAt:
        v.endsAt !== original.endsAt
          ? (dateError(v.endsAt) ??
            windowError(toLocalInput(batch.startsAt), v.endsAt))
          : null,
    });
    setErrors(found);
    if (Object.keys(found).length === 0 && changed) setConfirming(true);
  }

  return (
    <>
      <form onSubmit={submit} noValidate>
        <Section title={t('admin.vouchers.settings')}>
          <div className="grid content-start gap-2 md:max-w-sm">
            <DateTimeField
              label={t('admin.vouchers.endsAt')}
              hint={t('admin.vouchers.batches.endsAtHint')}
              value={v.endsAt}
              error={err('endsAt')}
              onChange={(x) => {
                setV((c) => ({ ...c, endsAt: x }));
                setErrors({});
              }}
            />
            {v.endsAt !== '' ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={() => setV((c) => ({ ...c, endsAt: '' }))}
              >
                {t('admin.vouchers.removeEnd')}
              </Button>
            ) : null}
          </div>
          <TextAreaField
            label={t('admin.vouchers.note')}
            maxLength={500}
            value={v.note}
            error={err('note')}
            onChange={(x) => setV((c) => ({ ...c, note: x }))}
          />
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={!changed}
              onClick={() => {
                setV(original);
                setErrors({});
              }}
            >
              {t('admin.vouchers.undo')}
            </Button>
            <Button type="submit" disabled={!changed}>
              {t('admin.catalog.save')}
            </Button>
          </div>
        </Section>
      </form>
      {confirming ? (
        <ReasonDialog
          open
          onOpenChange={setConfirming}
          title={t('admin.vouchers.saveTitle')}
          description={batch.name}
          submitLabel={t('admin.catalog.save')}
          notice={
            <div className="bg-surface-muted rounded-md p-3 text-sm">
              <p className="text-fg-muted">
                {t('admin.vouchers.changesIntro')}
              </p>
              <ul className="text-fg mt-1 list-disc ps-5">
                {changes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          }
          onSubmit={async ({ reason }) => {
            try {
              await update.mutateAsync({
                path: { id: batch.id },
                body: { reason, ...patch },
              });
            } catch (error) {
              const fields = serverFieldErrors(error);
              if (fields) setErrors(fields);
              throw error;
            }
            await invalidateVouchers(queryClient);
            toast.success(t('admin.vouchers.saved'));
          }}
        />
      ) : null}
    </>
  );
}

function CreatedNotice({ batch }: { batch: VoucherBatchDto }) {
  const { t } = useTranslation();
  const b = (key: string, options?: Record<string, unknown>) =>
    t(`admin.vouchers.batches.${key}`, options ?? {});
  return (
    <section className="bg-surface border-border-subtle grid gap-4 rounded-lg border p-5">
      <div>
        <p className="text-success text-sm font-semibold">{b('created')}</p>
        <h3 className="text-fg text-lg font-bold">
          {b('createdTitle', {
            codes: b('codesCount', { count: batch.quantity }),
          })}
        </h3>
        <p className="text-fg-muted text-sm">{b('createdBody')}</p>
      </div>
      <BatchDownload batch={batch} primary />
      <div className="bg-warning-container border-warning-border text-fg flex items-start gap-2 rounded-md border p-3 text-sm">
        <TriangleAlert
          aria-hidden="true"
          className="text-warning mt-0.5 size-4 shrink-0"
        />
        <span>
          <strong className="block">{b('noticeTitle')}</strong>
          {b('noticeBody')}
        </span>
      </div>
    </section>
  );
}

/** S23 frame 4: on phones the codes come right after progress. */
export function BatchDetailPage() {
  const { t } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  const { batchId } = useParams({ strict: false }) as { batchId: string };
  const { created } = useSearch({ strict: false }) as { created?: boolean };
  const query = useBatch(batchId);
  if (
    query.isError &&
    isApiError(query.error) &&
    query.error.code === 'VOUCHER_BATCH_NOT_FOUND'
  ) {
    return (
      <>
        <BackToBatches />
        <div className="bg-surface border-border-subtle grid justify-items-center gap-2 rounded-lg border p-10 text-center">
          <p className="text-fg text-lg font-semibold">{b('notFoundTitle')}</p>
          <p className="text-fg-muted">{t(errorMessageKey(query.error))}</p>
        </div>
      </>
    );
  }
  const batch = query.data;
  return (
    <>
      <BackToBatches />
      <QueryState query={query} error={b('detailError')}>
        {batch ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-fg text-xl font-bold">{batch.name}</h2>
                <KindBadge kind={batch.kind} />
                <StatusBadge status={batchStatus(batch)} />
              </div>
              <div className="flex flex-wrap gap-3">
                {created ? null : <BatchDownload batch={batch} />}
                <ToggleBatch batch={batch} />
              </div>
            </div>
            {created ? <CreatedNotice batch={batch} /> : null}
            {batch.isActive ? null : (
              <Alert variant="warning">{b('inactiveBanner')}</Alert>
            )}
            <Progress batch={batch} />
            <div className="md:order-last">
              <BatchCodes batch={batch} />
            </div>
            <Summary batch={batch} />
            {/* Keyed by id only: turning the batch off must not discard edits. */}
            <Settings key={batch.id} batch={batch} />
          </div>
        ) : null}
      </QueryState>
    </>
  );
}
