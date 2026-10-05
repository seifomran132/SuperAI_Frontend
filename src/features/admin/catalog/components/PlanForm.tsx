import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminPlansControllerCreateMutation,
  adminPlansControllerUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import type { PlanDto } from '~/api/generated/types.gen';
import { Button } from '~/components/ui/button';
import {
  CheckField,
  TextAreaField,
  TextField,
} from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import {
  collect,
  decimalError,
  keyError,
  requiredError,
  serverFieldErrors,
  sortError,
  type Errors,
} from '../model/form';
import { invalidateCatalog } from '../model/queries';
import { ModeChecklist } from './ModeChecklist';

/** Create (no `plan`) or edit one plan; the write asks for a reason in a dialog. */
export function PlanForm({ plan }: { plan?: PlanDto }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const create = useMutation(adminPlansControllerCreateMutation());
  const update = useMutation(adminPlansControllerUpdateMutation());
  const [v, setV] = useState({
    key: plan?.key ?? '',
    nameAr: plan?.nameAr ?? '',
    nameEn: plan?.nameEn ?? '',
    descriptionAr: plan?.descriptionAr ?? '',
    descriptionEn: plan?.descriptionEn ?? '',
    monthlyPriceUsd: plan?.monthlyPriceUsd ?? '0',
    includedBalanceUsd: plan?.includedBalanceUsd ?? '0',
    sortOrder: String(plan?.sortOrder ?? 0),
    isPublic: plan?.isPublic ?? true,
    isActive: plan?.isActive ?? true,
    isDefault: plan?.isDefault ?? false,
    modeKeys: [] as string[],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);

  const set = <K extends keyof typeof v>(field: K, value: (typeof v)[K]) => {
    setV((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
  };
  const err = (field: string) =>
    errors[field] ? t(`admin.${errors[field]}`) : undefined;

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = collect({
      ...(plan ? {} : { key: keyError(v.key) }),
      nameAr: requiredError(v.nameAr),
      nameEn: requiredError(v.nameEn),
      descriptionAr: requiredError(v.descriptionAr),
      descriptionEn: requiredError(v.descriptionEn),
      monthlyPriceUsd: decimalError(v.monthlyPriceUsd),
      includedBalanceUsd: decimalError(v.includedBalanceUsd),
      sortOrder: sortError(v.sortOrder),
    });
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  }

  const common = {
    nameAr: v.nameAr.trim(),
    nameEn: v.nameEn.trim(),
    descriptionAr: v.descriptionAr.trim(),
    descriptionEn: v.descriptionEn.trim(),
    monthlyPriceUsd: v.monthlyPriceUsd.trim(),
    includedBalanceUsd: v.includedBalanceUsd.trim(),
    sortOrder: parseInt(v.sortOrder, 10),
    isPublic: v.isPublic,
    isActive: v.isActive,
  };

  return (
    <>
      <form onSubmit={submit} noValidate className="grid gap-6">
        <Section title={t('admin.plans.formTitle')}>
          <div className="grid gap-4 md:grid-cols-2">
            {plan ? (
              <div className="grid content-start gap-1 md:col-span-2">
                <span className="text-fg-muted text-sm">
                  {t('admin.plans.key')}
                </span>
                <bdi dir="ltr" className="text-fg text-start">
                  {plan.key}
                </bdi>
              </div>
            ) : (
              <div className="md:col-span-2">
                <TextField
                  label={t('admin.plans.key')}
                  hint={t('admin.catalog.keyHint')}
                  required
                  dir="ltr"
                  autoComplete="off"
                  value={v.key}
                  error={err('key')}
                  onChange={(x) => set('key', x)}
                />
              </div>
            )}
            <TextField
              label={t('admin.catalog.nameAr')}
              required
              value={v.nameAr}
              error={err('nameAr')}
              onChange={(x) => set('nameAr', x)}
            />
            <TextField
              label={t('admin.catalog.nameEn')}
              required
              dir="ltr"
              value={v.nameEn}
              error={err('nameEn')}
              onChange={(x) => set('nameEn', x)}
            />
            <TextAreaField
              label={t('admin.catalog.descriptionAr')}
              required
              value={v.descriptionAr}
              error={err('descriptionAr')}
              onChange={(x) => set('descriptionAr', x)}
            />
            <TextAreaField
              label={t('admin.catalog.descriptionEn')}
              required
              value={v.descriptionEn}
              error={err('descriptionEn')}
              onChange={(x) => set('descriptionEn', x)}
            />
            <TextField
              label={t('admin.plans.monthlyPrice')}
              hint={plan ? t('admin.plans.newSubscriptionsOnly') : undefined}
              required
              dir="ltr"
              inputMode="decimal"
              value={v.monthlyPriceUsd}
              error={err('monthlyPriceUsd')}
              onChange={(x) => set('monthlyPriceUsd', x)}
            />
            <TextField
              label={t('admin.plans.includedBalance')}
              hint={plan ? t('admin.plans.newSubscriptionsOnly') : undefined}
              required
              dir="ltr"
              inputMode="decimal"
              value={v.includedBalanceUsd}
              error={err('includedBalanceUsd')}
              onChange={(x) => set('includedBalanceUsd', x)}
            />
            <TextField
              label={t('admin.catalog.sortOrder')}
              required
              dir="ltr"
              inputMode="numeric"
              value={v.sortOrder}
              error={err('sortOrder')}
              onChange={(x) => set('sortOrder', x)}
            />
          </div>
          <div className="grid gap-1">
            <CheckField
              label={t('admin.plans.isPublic')}
              description={t('admin.plans.isPublicHint')}
              checked={v.isPublic}
              onChange={(x) => set('isPublic', x)}
            />
            <CheckField
              label={t('admin.plans.isActive')}
              description={t('admin.plans.isActiveHint')}
              checked={v.isActive}
              disabled={plan?.isDefault}
              onChange={(x) => set('isActive', x)}
            />
            {plan ? (
              <CheckField
                label={t('admin.plans.isDefault')}
                description={t(
                  plan.isDefault
                    ? 'admin.plans.isDefaultCurrent'
                    : 'admin.plans.isDefaultHint',
                )}
                checked={v.isDefault}
                disabled={plan.isDefault}
                onChange={(x) => set('isDefault', x)}
              />
            ) : null}
          </div>
          {plan ? null : (
            <ModeChecklist
              selected={v.modeKeys}
              onChange={(x) => set('modeKeys', x)}
            />
          )}
          <div className="flex justify-end">
            <Button type="submit">
              {t(plan ? 'admin.catalog.save' : 'admin.plans.createSubmit')}
            </Button>
          </div>
        </Section>
      </form>

      {confirming ? (
        <ReasonDialog
          open
          onOpenChange={setConfirming}
          title={t(plan ? 'admin.plans.saveTitle' : 'admin.plans.createTitle')}
          description={plan ? plan.key : v.key.trim()}
          submitLabel={t(
            plan ? 'admin.catalog.save' : 'admin.plans.createSubmit',
          )}
          onSubmit={async ({ reason }) => {
            try {
              if (plan) {
                await update.mutateAsync({
                  path: { key: plan.key },
                  body: {
                    reason,
                    ...common,
                    ...(v.isDefault && !plan.isDefault
                      ? { isDefault: true }
                      : {}),
                  },
                });
              } else {
                await create.mutateAsync({
                  body: {
                    reason,
                    key: v.key.trim(),
                    ...common,
                    modeKeys: v.modeKeys,
                  },
                });
              }
            } catch (error) {
              const fields = serverFieldErrors(error);
              if (fields) setErrors(fields);
              throw error;
            }
            await invalidateCatalog(queryClient);
            toast.success(
              t(plan ? 'admin.plans.saved' : 'admin.plans.created'),
            );
            if (!plan) {
              void navigate({
                to: '/admin/plans/$key',
                params: { key: v.key.trim() },
              });
            }
          }}
        />
      ) : null}
    </>
  );
}
