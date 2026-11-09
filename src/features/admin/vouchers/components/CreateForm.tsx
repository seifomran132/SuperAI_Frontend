import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { adminVouchersCreateMutation } from '~/api/generated/@tanstack/react-query.gen';
import type { CreateVoucherDto, VoucherDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button, buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { Field, describedBy, textareaClass } from '../../components/Field';
import {
  CheckField,
  TextAreaField,
  TextField,
} from '../../components/FormControls';
import { Section } from '../../components/Section';
import { reasonError } from '../../model/validation';
import {
  collect,
  serverFieldErrors,
  type Errors,
} from '../../catalog/model/form';
import { fromLocalInput } from '../model/dates';
import { DateTimeField } from './DateTimeField';
import {
  amountError,
  codeError,
  dateError,
  daysError,
  limitError,
  windowError,
} from '../model/form';
import { invalidateVouchers, useTrialPlans } from '../model/queries';
import { KindField, PlanField, type VoucherKind } from './KindField';

/** S22 frame 2: create a balance or trial code; the reason is part of the form. */
export function CreateForm({
  onCreated,
}: {
  onCreated: (voucher: VoucherDto) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const create = useMutation(adminVouchersCreateMutation());
  // Loaded with the form, so the list is ready when trial is chosen.
  useTrialPlans();
  const [v, setV] = useState({
    kind: 'balance' as VoucherKind,
    amountUsd: '',
    planKey: '',
    trialDays: '',
    maxRedemptions: '1',
    code: '',
    startsAt: '',
    endsAt: '',
    newUsersOnly: false,
    note: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = <K extends keyof typeof v>(field: K, value: (typeof v)[K]) => {
    setV((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
  };
  // Keys are under `admin.`, except API codes, which come as `errors:CODE`.
  const err = (field: string) =>
    errors[field]
      ? t(
          errors[field].includes(':')
            ? errors[field]
            : `admin.${errors[field]}`,
        )
      : undefined;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (create.isPending) return;
    setFormError(null);
    const trial = v.kind === 'trial';
    const found = collect({
      ...(trial
        ? {
            planKey: v.planKey ? null : 'vouchers.errors.planRequired',
            trialDays: daysError(v.trialDays),
          }
        : { amountUsd: amountError(v.amountUsd) }),
      maxRedemptions: limitError(v.maxRedemptions),
      code: codeError(v.code),
      startsAt: dateError(v.startsAt),
      endsAt: dateError(v.endsAt) ?? windowError(v.startsAt, v.endsAt),
      reason: reasonError(v.reason),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body: CreateVoucherDto = {
      reason: v.reason.trim(),
      kind: v.kind,
      maxRedemptions: parseInt(v.maxRedemptions, 10),
      ...(trial
        ? { planKey: v.planKey, trialDays: parseInt(v.trialDays, 10) }
        : { amountUsd: v.amountUsd.trim() }),
      ...(v.code.trim() ? { code: v.code.trim() } : {}),
      ...(v.startsAt ? { startsAt: fromLocalInput(v.startsAt)! } : {}),
      ...(v.endsAt ? { endsAt: fromLocalInput(v.endsAt)! } : {}),
      ...(v.newUsersOnly ? { newUsersOnly: true } : {}),
      ...(v.note.trim() ? { note: v.note.trim() } : {}),
    };
    try {
      const voucher = await create.mutateAsync({ body });
      await invalidateVouchers(queryClient);
      onCreated(voucher);
    } catch (error) {
      if (isApiError(error) && error.code === 'VOUCHER_CODE_TAKEN') {
        setErrors({ code: `errors:${error.code}` });
      } else if (
        isApiError(error) &&
        (error.code === 'PLAN_NOT_FOUND' || error.code === 'PLAN_NOT_ACTIVE')
      ) {
        setErrors({ planKey: `errors:${error.code}` });
      } else {
        const fields = serverFieldErrors(error);
        if (fields) {
          // API field names match the form's (they follow the DTO).
          setErrors(fields);
        } else {
          setFormError(errorMessageKey(error));
        }
      }
    }
  }

  const reasonText = err('reason');
  const trial = v.kind === 'trial';
  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <Section title={t('admin.vouchers.formTitle')}>
        <KindField value={v.kind} onChange={(x) => set('kind', x)} />

        <div className="grid gap-4 md:grid-cols-2">
          {trial ? (
            <>
              <PlanField
                value={v.planKey}
                error={err('planKey')}
                onChange={(x) => set('planKey', x)}
              />
              <TextField
                label={t('admin.vouchers.trialDays')}
                hint={t('admin.vouchers.trialDaysHint')}
                required
                dir="ltr"
                inputMode="numeric"
                value={v.trialDays}
                error={err('trialDays')}
                onChange={(x) => set('trialDays', x)}
              />
            </>
          ) : (
            <TextField
              label={t('admin.vouchers.amount')}
              hint={t('admin.vouchers.amountHint')}
              required
              dir="ltr"
              inputMode="decimal"
              value={v.amountUsd}
              error={err('amountUsd')}
              onChange={(x) => set('amountUsd', x)}
            />
          )}
          <TextField
            label={t('admin.vouchers.maxRedemptions')}
            hint={t('admin.vouchers.maxRedemptionsHint')}
            required
            dir="ltr"
            inputMode="numeric"
            value={v.maxRedemptions}
            error={err('maxRedemptions')}
            onChange={(x) => set('maxRedemptions', x)}
          />
          <div className="md:col-span-2">
            <TextField
              label={t('admin.vouchers.code')}
              hint={t('admin.vouchers.codeHint')}
              dir="ltr"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={40}
              value={v.code}
              error={err('code')}
              onChange={(x) => set('code', x)}
            />
          </div>
          <DateTimeField
            label={t('admin.vouchers.startsAt')}
            hint={t('admin.vouchers.startsAtHint')}
            value={v.startsAt}
            error={err('startsAt')}
            onChange={(x) => set('startsAt', x)}
          />
          <DateTimeField
            label={t('admin.vouchers.endsAt')}
            hint={t('admin.vouchers.endsAtHint')}
            value={v.endsAt}
            error={err('endsAt')}
            onChange={(x) => set('endsAt', x)}
          />
        </div>
        <CheckField
          label={t('admin.vouchers.newUsersOnly')}
          description={t('admin.vouchers.newUsersOnlyHint')}
          checked={v.newUsersOnly}
          onChange={(x) => set('newUsersOnly', x)}
        />
        <TextAreaField
          label={t('admin.vouchers.note')}
          maxLength={500}
          value={v.note}
          error={err('note')}
          onChange={(x) => set('note', x)}
        />
        <Field
          id="voucher-reason"
          label={t('admin.dialog.reason')}
          required
          hint={t('admin.dialog.reasonHint')}
          error={reasonText}
        >
          <textarea
            id="voucher-reason"
            value={v.reason}
            maxLength={600}
            aria-invalid={reasonText ? true : undefined}
            aria-describedby={describedBy(
              'voucher-reason',
              true,
              Boolean(reasonText),
            )}
            onChange={(event) => set('reason', event.target.value)}
            className={textareaClass}
          />
        </Field>
        {formError ? (
          <Alert variant="danger">
            <strong className="block">{t('admin.dialog.failed')}</strong>
            {t(formError)}
          </Alert>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            to="/admin/vouchers"
            className={cn(buttonVariants({ variant: 'secondary' }))}
          >
            {t('admin.common.cancel')}
          </Link>
          <Button type="submit" loading={create.isPending}>
            {t(
              create.isPending
                ? 'admin.vouchers.creating'
                : 'admin.vouchers.createSubmit',
            )}
          </Button>
        </div>
      </Section>
    </form>
  );
}
