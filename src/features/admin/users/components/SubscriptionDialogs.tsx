import { useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminSubscriptionsControllerAssignMutation,
  adminSubscriptionsControllerEndMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import { Alert } from '~/components/ui/alert';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { Field, describedBy } from '../../components/Field';
import { ReasonDialog } from '../../components/ReasonDialog';
import { periodEndIso } from '../../model/validation';
import { invalidateUser, useActivePlans } from '../model/queries';

interface DialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const selectClass =
  'bg-surface text-fg border-border-control focus-visible:outline-focus h-12 w-full rounded-md border px-3 text-base outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-danger aria-invalid:border-2';

/** Activate a plan: plan, optional end date (one month by default), reason, idempotency key. */
export function ActivatePlanDialog({ userId, ...rest }: DialogProps) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminSubscriptionsControllerAssignMutation());
  const plans = useActivePlans();
  const [planKey, setPlanKey] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <ReasonDialog
      {...rest}
      title={t('admin.subscription.activateTitle')}
      submitLabel={t('admin.subscription.activateSubmit')}
      fieldNames={['planKey', 'currentPeriodEnd']}
      validate={() => {
        const errors: Record<string, string> = {};
        if (!planKey) errors.planKey = 'subscription.planRequired';
        if (endDate && !periodEndIso(endDate)) {
          errors.currentPeriodEnd = 'subscription.endDatePast';
        }
        return errors;
      }}
      fields={({ errors, clearError }) => (
        <>
          <Field
            id={`${id}-plan`}
            label={t('admin.subscription.planLabel')}
            required
            error={errors.planKey ? t(`admin.${errors.planKey}`) : undefined}
          >
            {plans.isError ? (
              <Alert variant="danger">
                {t('admin.subscription.plansError')}
              </Alert>
            ) : (
              <select
                id={`${id}-plan`}
                value={planKey}
                disabled={plans.isPending}
                aria-invalid={errors.planKey ? true : undefined}
                aria-describedby={describedBy(
                  `${id}-plan`,
                  false,
                  Boolean(errors.planKey),
                )}
                onChange={(event) => {
                  setPlanKey(event.target.value);
                  clearError('planKey');
                }}
                className={selectClass}
              >
                <option value="">
                  {t('admin.subscription.planPlaceholder')}
                </option>
                {plans.plans.map((plan) => (
                  <option key={plan.key} value={plan.key}>
                    {i18n.language === 'en' ? plan.nameEn : plan.nameAr}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            id={`${id}-end`}
            label={t('admin.subscription.endDateLabel')}
            hint={t('admin.subscription.endDateHint')}
            error={
              errors.currentPeriodEnd
                ? t(
                    errors.currentPeriodEnd.startsWith('subscription.')
                      ? `admin.${errors.currentPeriodEnd}`
                      : 'admin.dialog.fieldInvalid',
                  )
                : undefined
            }
          >
            <Input
              id={`${id}-end`}
              type="date"
              dir="ltr"
              value={endDate}
              aria-invalid={errors.currentPeriodEnd ? true : undefined}
              aria-describedby={describedBy(
                `${id}-end`,
                true,
                Boolean(errors.currentPeriodEnd),
              )}
              onChange={(event) => {
                setEndDate(event.target.value);
                clearError('currentPeriodEnd');
              }}
              className={cn('text-start')}
            />
          </Field>
        </>
      )}
      onSubmit={async ({ reason, idempotencyKey }) => {
        const currentPeriodEnd = endDate ? periodEndIso(endDate) : null;
        await mutation.mutateAsync({
          path: { id: userId },
          body: {
            reason,
            planKey,
            idempotencyKey,
            ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
          },
        });
        await invalidateUser(queryClient, userId);
        toast.success(t('admin.subscription.activated'));
      }}
    />
  );
}

/** End the plan (danger): all of the user's balance expires. */
export function EndPlanDialog({ userId, ...rest }: DialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminSubscriptionsControllerEndMutation());
  return (
    <ReasonDialog
      {...rest}
      danger
      title={t('admin.subscription.endTitle')}
      submitLabel={t('admin.subscription.endSubmit')}
      notice={
        <Alert variant="warning">
          <strong className="block">
            {t('admin.subscription.endWarning')}
          </strong>
          {t('admin.subscription.endWarningBody')}
        </Alert>
      }
      onSubmit={async ({ reason }) => {
        await mutation.mutateAsync({ path: { id: userId }, body: { reason } });
        await invalidateUser(queryClient, userId);
        toast.success(t('admin.subscription.ended'));
      }}
    />
  );
}
