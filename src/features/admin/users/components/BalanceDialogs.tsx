import { useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminLedgerControllerAdjustMutation,
  adminLedgerControllerRecordPurchaseMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import { Input } from '~/components/ui/input';
import { Field, describedBy } from '../../components/Field';
import { ReasonDialog } from '../../components/ReasonDialog';
import { amountError } from '../../model/validation';
import { invalidateUser } from '../model/queries';

interface DialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Decimal text field with a USD suffix; the value stays a string end to end. */
function AmountField({
  id,
  value,
  onChange,
  error,
  hint,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  const { t } = useTranslation();
  return (
    <Field
      id={id}
      label={t('admin.balance.amountLabel')}
      required
      hint={hint}
      error={error}
    >
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          dir="ltr"
          autoComplete="off"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, Boolean(hint), Boolean(error))}
          onChange={(event) => onChange(event.target.value)}
          className="pe-16 text-start"
        />
        <span
          aria-hidden="true"
          className="text-fg-muted pointer-events-none absolute inset-y-0 end-4 flex items-center text-sm"
        >
          {t('admin.balance.currency')}
        </span>
      </div>
    </Field>
  );
}

/** Add (positive) or remove (negative) funds; the sign is part of the typed string. */
export function AdjustDialog({ userId, ...rest }: DialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminLedgerControllerAdjustMutation());
  const [amount, setAmount] = useState('');
  return (
    <ReasonDialog
      {...rest}
      title={t('admin.balance.adjustTitle')}
      submitLabel={t('admin.balance.adjustSubmit')}
      fieldNames={['amountUsd']}
      validate={() => {
        const problem = amountError(amount, { signed: true });
        const errors: Record<string, string> = {};
        if (problem) errors.amountUsd = problem;
        return errors;
      }}
      fields={({ errors, clearError }) => (
        <AmountField
          id={`${id}-amount`}
          value={amount}
          hint={t('admin.balance.amountHint')}
          error={
            errors.amountUsd
              ? t(
                  errors.amountUsd.startsWith('balance.')
                    ? `admin.${errors.amountUsd}`
                    : 'admin.dialog.fieldInvalid',
                )
              : undefined
          }
          onChange={(value) => {
            setAmount(value);
            clearError('amountUsd');
          }}
        />
      )}
      onSubmit={async ({ reason, idempotencyKey }) => {
        await mutation.mutateAsync({
          path: { id: userId },
          body: { reason, amountUsd: amount.trim(), idempotencyKey },
        });
        await invalidateUser(queryClient, userId);
        toast.success(t('admin.balance.adjusted'));
      }}
    />
  );
}

/** Offline payment: de-duplicated by its payment reference, so no idempotency key is sent. */
export function PurchaseDialog({ userId, ...rest }: DialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminLedgerControllerRecordPurchaseMutation());
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  return (
    <ReasonDialog
      {...rest}
      title={t('admin.balance.paymentTitle')}
      submitLabel={t('admin.balance.paymentSubmit')}
      fieldNames={['amountUsd', 'paymentReference']}
      validate={() => {
        const errors: Record<string, string> = {};
        const problem = amountError(amount, { signed: false });
        if (problem) errors.amountUsd = problem;
        if (!reference.trim()) {
          errors.paymentReference = 'balance.referenceRequired';
        }
        return errors;
      }}
      fields={({ errors, clearError }) => {
        const text = (key: string | undefined, fallback: string) =>
          key ? t(key.includes('.') ? `admin.${key}` : fallback) : undefined;
        return (
          <>
            <AmountField
              id={`${id}-amount`}
              value={amount}
              error={text(errors.amountUsd, 'admin.dialog.fieldInvalid')}
              onChange={(value) => {
                setAmount(value);
                clearError('amountUsd');
              }}
            />
            <Field
              id={`${id}-reference`}
              label={t('admin.balance.referenceLabel')}
              required
              hint={t('admin.balance.referenceHint')}
              error={text(errors.paymentReference, 'admin.dialog.fieldInvalid')}
            >
              <Input
                id={`${id}-reference`}
                dir="ltr"
                autoComplete="off"
                value={reference}
                aria-invalid={errors.paymentReference ? true : undefined}
                aria-describedby={describedBy(
                  `${id}-reference`,
                  true,
                  Boolean(errors.paymentReference),
                )}
                onChange={(event) => {
                  setReference(event.target.value);
                  clearError('paymentReference');
                }}
                className="text-start"
              />
            </Field>
          </>
        );
      }}
      onSubmit={async ({ reason }) => {
        const result = await mutation.mutateAsync({
          path: { id: userId },
          body: {
            reason,
            amountUsd: amount.trim(),
            paymentReference: reference.trim(),
          },
        });
        await invalidateUser(queryClient, userId);
        toast.success(
          t(
            result.replayed
              ? 'admin.balance.replayed'
              : 'admin.balance.recorded',
          ),
        );
      }}
    />
  );
}
