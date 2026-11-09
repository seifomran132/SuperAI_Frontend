import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { adminVouchersUpdateMutation } from '~/api/generated/@tanstack/react-query.gen';
import type { UpdateVoucherDto, VoucherDto } from '~/api/generated/types.gen';
import { Button } from '~/components/ui/button';
import {
  collect,
  serverFieldErrors,
  type Errors,
} from '../../catalog/model/form';
import { TextAreaField, TextField } from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { fromLocalInput, toLocalInput } from '../model/dates';
import { DateTimeField } from './DateTimeField';
import { dateError, limitError, windowError } from '../model/form';
import { invalidateVouchers } from '../model/queries';

/** S22 frame 4: end, limit and note; only changed fields are sent, with a reason. */
export function SettingsForm({ voucher }: { voucher: VoucherDto }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const update = useMutation(adminVouchersUpdateMutation());
  const original = {
    endsAt: toLocalInput(voucher.endsAt),
    maxRedemptions: String(voucher.maxRedemptions),
    note: voucher.note ?? '',
  };
  const [v, setV] = useState(original);
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);
  const inBatch = voucher.batchId !== null;

  const set = <K extends keyof typeof v>(field: K, value: (typeof v)[K]) => {
    setV((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
  };
  const err = (field: string) =>
    errors[field]
      ? t(`admin.${errors[field]}`, { used: voucher.redemptionCount })
      : undefined;

  // The patch holds only what changed.
  const changes: string[] = [];
  const patch: Omit<UpdateVoucherDto, 'reason'> = {};
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
  if (v.maxRedemptions.trim() !== original.maxRedemptions) {
    const n = parseInt(v.maxRedemptions, 10);
    if (!Number.isNaN(n)) patch.maxRedemptions = n;
    changes.push(t('admin.vouchers.changeLimit'));
  }
  if (v.note.trim() !== original.note) {
    patch.note = v.note.trim() === '' ? null : v.note.trim();
    changes.push(t('admin.vouchers.changeNote'));
  }
  const changed = changes.length > 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    // An end that was not touched may already be in the past (an expired code):
    // it must not block editing the limit or the note.
    const endChanged = v.endsAt !== original.endsAt;
    const found = collect({
      endsAt: endChanged
        ? (dateError(v.endsAt) ??
          windowError(toLocalInput(voucher.startsAt), v.endsAt))
        : null,
      maxRedemptions: inBatch
        ? null
        : limitError(v.maxRedemptions, voucher.redemptionCount),
    });
    setErrors(found);
    if (Object.keys(found).length === 0 && changed) setConfirming(true);
  }

  return (
    <>
      <form onSubmit={submit} noValidate>
        <Section title={t('admin.vouchers.settings')}>
          {inBatch ? null : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid content-start gap-2">
                <DateTimeField
                  label={t('admin.vouchers.endsAt')}
                  hint={t('admin.vouchers.endsAtHint')}
                  value={v.endsAt}
                  error={err('endsAt')}
                  onChange={(x) => set('endsAt', x)}
                />
                {v.endsAt !== '' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={() => set('endsAt', '')}
                  >
                    {t('admin.vouchers.removeEnd')}
                  </Button>
                ) : null}
              </div>
              <TextField
                label={t('admin.vouchers.maxRedemptions')}
                hint={t('admin.vouchers.limitHint', {
                  used: voucher.redemptionCount,
                })}
                required
                dir="ltr"
                inputMode="numeric"
                value={v.maxRedemptions}
                error={err('maxRedemptions')}
                onChange={(x) => set('maxRedemptions', x)}
              />
            </div>
          )}
          <TextAreaField
            label={t('admin.vouchers.note')}
            maxLength={500}
            value={v.note}
            error={err('note')}
            onChange={(x) => set('note', x)}
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
          description={voucher.code}
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
                path: { id: voucher.id },
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
