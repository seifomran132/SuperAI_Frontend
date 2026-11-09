import { useRef, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { adminVoucherBatchesCreateMutation } from '~/api/generated/@tanstack/react-query.gen';
import type {
  CreateVoucherBatchDto,
  VoucherBatchDto,
} from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Alert } from '~/components/ui/alert';
import { Button, buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import {
  collect,
  serverFieldErrors,
  type Errors,
} from '../../catalog/model/form';
import { Field, describedBy, textareaClass } from '../../components/Field';
import {
  CheckField,
  TextAreaField,
  TextField,
} from '../../components/FormControls';
import { Section } from '../../components/Section';
import { reasonError } from '../../model/validation';
import {
  DEFAULT_PREFIX,
  DEFAULT_QUANTITY,
  MAX_BATCH_TOTAL,
  batchTotal,
  exampleCode,
  overBatchLimit,
  prefixError,
  quantityError,
} from '../model/batches';
import { fromLocalInput } from '../model/dates';
import { amountError, dateError, daysError, windowError } from '../model/form';
import { invalidateVouchers, useTrialPlans } from '../model/queries';
import { DateTimeField } from './DateTimeField';
import { KindField, PlanField, type VoucherKind } from './KindField';

/** S23 frames 2-3: 3-100 single-use codes; the reason is part of the form. */
export function BatchForm({
  onCreated,
}: {
  onCreated: (batch: VoucherBatchDto) => void;
}) {
  const { t, i18n } = useTranslation();
  const b = (key: string, options?: Record<string, unknown>) =>
    t(`admin.vouchers.batches.${key}`, options ?? {});
  const queryClient = useQueryClient();
  const create = useMutation(adminVoucherBatchesCreateMutation());
  const { plans } = useTrialPlans();
  const [v, setV] = useState({
    name: '',
    kind: 'balance' as VoucherKind,
    amountUsd: '',
    planKey: '',
    trialDays: '',
    quantity: String(DEFAULT_QUANTITY),
    prefix: '',
    startsAt: '',
    endsAt: '',
    newUsersOnly: false,
    note: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  // One key per set of values: a retry of the same values must not make a
  // second batch, and changed values under the same key are refused.
  const idempotencyKey = useRef(crypto.randomUUID());
  const sentValues = useRef('');
  const renewKey = () => {
    idempotencyKey.current = crypto.randomUUID();
    sentValues.current = '';
  };

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
      ? t(
          errors[field].includes(':')
            ? errors[field]
            : `admin.${errors[field]}`,
        )
      : undefined;

  const trial = v.kind === 'trial';
  const total = trial ? null : batchTotal(v.quantity, v.amountUsd);
  const overLimit = overBatchLimit(total);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (create.isPending || overLimit) return;
    setFormError(null);
    const found = collect({
      name: v.name.trim() ? null : 'vouchers.batches.errors.nameRequired',
      ...(trial
        ? {
            planKey: v.planKey ? null : 'vouchers.errors.planRequired',
            trialDays: daysError(v.trialDays),
          }
        : { amountUsd: amountError(v.amountUsd) }),
      quantity: quantityError(v.quantity),
      prefix: prefixError(v.prefix),
      startsAt: dateError(v.startsAt),
      endsAt: dateError(v.endsAt) ?? windowError(v.startsAt, v.endsAt),
      reason: reasonError(v.reason),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const values: Omit<CreateVoucherBatchDto, 'idempotencyKey'> = {
      reason: v.reason.trim(),
      name: v.name.trim(),
      kind: v.kind,
      quantity: parseInt(v.quantity, 10),
      ...(trial
        ? { planKey: v.planKey, trialDays: parseInt(v.trialDays, 10) }
        : { amountUsd: v.amountUsd.trim() }),
      ...(v.prefix.trim() ? { prefix: v.prefix.trim() } : {}),
      ...(v.startsAt ? { startsAt: fromLocalInput(v.startsAt)! } : {}),
      ...(v.endsAt ? { endsAt: fromLocalInput(v.endsAt)! } : {}),
      ...(v.newUsersOnly ? { newUsersOnly: true } : {}),
      ...(v.note.trim() ? { note: v.note.trim() } : {}),
    };
    const fingerprint = JSON.stringify(values);
    if (sentValues.current && sentValues.current !== fingerprint) renewKey();
    sentValues.current = fingerprint;

    try {
      const batch = await create.mutateAsync({
        body: { ...values, idempotencyKey: idempotencyKey.current },
      });
      await invalidateVouchers(queryClient);
      onCreated(batch);
    } catch (error) {
      if (isApiError(error) && error.code === 'IDEMPOTENCY_KEY_REUSED') {
        renewKey();
        setFormError('admin.dialog.keyReused');
      } else if (isApiError(error) && error.code === 'VOUCHER_CODE_TAKEN') {
        // Nothing was saved; the same key would repeat the same failure.
        renewKey();
        setFormError(errorMessageKey(error));
      } else if (
        isApiError(error) &&
        (error.code === 'PLAN_NOT_FOUND' || error.code === 'PLAN_NOT_ACTIVE')
      ) {
        setErrors({ planKey: `errors:${error.code}` });
      } else {
        const fields = serverFieldErrors(error);
        if (fields) setErrors(fields);
        else setFormError(errorMessageKey(error));
      }
    }
  }

  const planName = plans.find((plan) => plan.key === v.planKey);
  const reasonText = err('reason');
  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <Section title={b('groupBatch')}>
        <TextField
          label={b('name')}
          hint={b('nameHint')}
          required
          maxLength={100}
          value={v.name}
          error={err('name')}
          onChange={(x) => set('name', x)}
        />
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
              label={b('amount')}
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
            label={b('quantity')}
            hint={b('quantityHint')}
            required
            dir="ltr"
            inputMode="numeric"
            value={v.quantity}
            error={err('quantity')}
            onChange={(x) => set('quantity', x)}
          />
        </div>
      </Section>

      <Section title={b('groupFormat')}>
        <TextField
          label={b('prefix')}
          hint={b('prefixHint')}
          dir="ltr"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
          value={v.prefix}
          error={err('prefix')}
          onChange={(x) => set('prefix', x)}
        />
        <div className="grid gap-1">
          <p className="text-fg-muted flex flex-wrap items-center gap-2 text-sm">
            {b('example')}
            <bdi
              dir="ltr"
              className="bg-surface-muted text-fg rounded-sm px-2 py-1 font-mono text-sm"
            >
              {exampleCode(v.prefix)}
            </bdi>
          </p>
          <p className="text-fg-muted text-sm">
            {v.prefix.trim()
              ? b('randomHint')
              : b('noPrefixHint', { defaultPrefix: DEFAULT_PREFIX })}
          </p>
        </div>
      </Section>

      <Section title={b('groupPeriod')}>
        <div className="grid gap-4 md:grid-cols-2">
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
      </Section>

      <Section title={b('groupConfirm')}>
        <div
          aria-live="polite"
          className={cn(
            'rounded-md border p-4',
            overLimit
              ? 'border-danger-border bg-danger-container'
              : 'border-border-subtle bg-surface-muted',
          )}
        >
          {trial ? (
            <>
              <p className="text-fg font-semibold">{b('summary')}</p>
              <p className="text-fg-muted text-sm">
                {b('trialSummary', {
                  codes: b('codesCount', {
                    count: quantityError(v.quantity)
                      ? 0
                      : parseInt(v.quantity, 10),
                  }),
                  plan: planName
                    ? i18n.language === 'en'
                      ? planName.nameEn
                      : planName.nameAr
                    : '-',
                  days: t('admin.vouchers.days', {
                    count: parseInt(v.trialDays, 10) || 0,
                  }),
                })}
              </p>
            </>
          ) : total ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-fg font-semibold">{b('total')}</span>
                <span
                  className={cn(
                    'text-2xl font-bold',
                    overLimit ? 'text-danger' : 'text-fg',
                  )}
                >
                  <Money value={total.toFixed()} />
                </span>
              </div>
              <p className="text-fg-muted text-sm">
                {b('codesCount', { count: parseInt(v.quantity, 10) })} ×{' '}
                <Money value={v.amountUsd.trim()} />
              </p>
              {overLimit ? (
                <p role="alert" className="text-danger mt-2 text-sm">
                  {b('overLimit')} (<Money value={MAX_BATCH_TOTAL} />
                  ). {b('overLimitHint')}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-fg-muted text-sm">{b('totalInvalid')}</p>
          )}
        </div>
        <Field
          id="batch-reason"
          label={t('admin.dialog.reason')}
          required
          hint={t('admin.dialog.reasonHint')}
          error={reasonText}
        >
          <textarea
            id="batch-reason"
            value={v.reason}
            maxLength={600}
            aria-invalid={reasonText ? true : undefined}
            aria-describedby={describedBy(
              'batch-reason',
              true,
              Boolean(reasonText),
            )}
            onChange={(event) => set('reason', event.target.value)}
            className={textareaClass}
          />
        </Field>
        {formError ? (
          <Alert variant="danger">
            <strong className="block">{b('createFailed')}</strong>
            {t(formError)}
          </Alert>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            to="/admin/vouchers"
            search={{ tab: 'batches' }}
            className={cn(buttonVariants({ variant: 'secondary' }))}
          >
            {t('admin.common.cancel')}
          </Link>
          <Button type="submit" loading={create.isPending} disabled={overLimit}>
            {create.isPending
              ? t('admin.vouchers.creating')
              : b('createSubmit')}
          </Button>
        </div>
      </Section>
    </form>
  );
}
