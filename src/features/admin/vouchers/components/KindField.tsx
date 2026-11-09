import { useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { cn } from '~/lib/utils';
import { SelectField } from '../../components/FormControls';
import { useTrialPlans } from '../model/queries';

export type VoucherKind = 'balance' | 'trial';

/** Balance or trial, as two large radio cards. */
export function KindField({
  value,
  onChange,
}: {
  value: VoucherKind;
  onChange: (kind: VoucherKind) => void;
}) {
  const { t } = useTranslation();
  return (
    <fieldset className="grid gap-2">
      <legend className="text-fg mb-2 text-sm font-medium">
        {t('admin.vouchers.kindLabel')}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(['balance', 'trial'] as const).map((kind) => (
          <label
            key={kind}
            className={cn(
              'focus-within:outline-focus flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-4 focus-within:outline-solid focus-within:outline-2 focus-within:outline-offset-2',
              value === kind
                ? 'border-brand bg-surface-muted border-2'
                : 'border-border-control',
            )}
          >
            <input
              type="radio"
              name="kind"
              value={kind}
              checked={value === kind}
              onChange={() => onChange(kind)}
              className="accent-brand mt-1 size-5 shrink-0 outline-hidden"
            />
            <span className="grid">
              <span className="text-fg font-semibold">
                {t(`admin.vouchers.kind.${kind}`)}
              </span>
              <span className="text-fg-muted text-sm">
                {t(`admin.vouchers.kindHint.${kind}`)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Active plans a trial may start, with its loading and error states. */
export function PlanField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (planKey: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const trialPlans = useTrialPlans();
  if (trialPlans.isError) {
    return (
      <div className="grid content-start gap-2">
        <span className="text-fg text-sm font-medium">
          {t('admin.vouchers.plan')}
        </span>
        <RetryAlert onRetry={() => void trialPlans.refetch()}>
          {t('admin.vouchers.planLoadError')}
        </RetryAlert>
      </div>
    );
  }
  return (
    <SelectField
      label={t('admin.vouchers.plan')}
      hint={t('admin.vouchers.planHint')}
      required
      value={value}
      disabled={trialPlans.isPending}
      error={error}
      onChange={onChange}
    >
      <option value="">
        {trialPlans.isPending
          ? t('admin.vouchers.planLoading')
          : t('admin.vouchers.planPlaceholder')}
      </option>
      {trialPlans.plans.map((plan) => (
        <option key={plan.key} value={plan.key}>
          {i18n.language === 'en' ? plan.nameEn : plan.nameAr}
        </option>
      ))}
    </SelectField>
  );
}
