import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminModelsCreateMutation,
  adminModelsUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import type { ModelDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button, buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import {
  CheckField,
  SelectField,
  TextField,
} from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import {
  collect,
  decimalError,
  integerError,
  percentError,
  requiredError,
  serverFieldErrors,
  type Errors,
} from '../model/form';
import {
  PRICE_FIELDS,
  type CatalogField,
  type ModelInitial,
} from '../model/prefill';
import { invalidateCatalog, useProviders } from '../model/queries';

export const THINKING = ['off', 'low', 'default'] as const;

/**
 * Create (no `model`) or edit one model. Provider and provider model id are
 * fixed after creation. A create form can start from `initial` (a model picked
 * from its provider): values from the public catalog are tagged, the provider
 * and id are read-only, and the first price can be entered with the model.
 */
export function ModelForm({
  model,
  initial,
}: {
  model?: ModelDto;
  initial?: ModelInitial;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const providers = useProviders();
  const create = useMutation(adminModelsCreateMutation());
  const update = useMutation(adminModelsUpdateMutation());
  const [v, setV] = useState({
    providerCode: model?.providerCode ?? initial?.providerCode ?? '',
    providerModelId: model?.providerModelId ?? initial?.providerModelId ?? '',
    displayName: model?.displayName ?? initial?.displayName ?? '',
    contextWindow: String(model?.contextWindow ?? initial?.contextWindow ?? ''),
    maxOutputTokens: String(
      model?.maxOutputTokens ?? initial?.maxOutputTokens ?? '',
    ),
    marginOverridePct: model?.marginOverridePct ?? '',
    thinking: model?.thinking ?? ('default' as ModelDto['thinking']),
    supportsImages: model?.supportsImages ?? initial?.supportsImages ?? false,
    isEnabled: model?.isEnabled ?? false,
  });
  // Prices are text all the way: copied from the catalog, sent as typed.
  const [price, setPrice] = useState(
    initial?.price ?? {
      inputPerMtok: '',
      outputPerMtok: '',
      cachedInputPerMtok: '',
      cacheWritePerMtok: '',
    },
  );
  const locked = Boolean(initial?.providerModelId);
  const originals: Partial<Record<CatalogField, string | boolean>> = initial
    ? {
        displayName: initial.displayName,
        contextWindow: initial.contextWindow,
        maxOutputTokens: initial.maxOutputTokens,
        supportsImages: initial.supportsImages,
        ...initial.price,
      }
    : {};
  /** «من الكتالوج» while the field still holds the catalog value. */
  const fromCatalog = (field: CatalogField, current: string | boolean) =>
    initial?.fromCatalog.includes(field) && originals[field] === current
      ? t('admin.models.picker.fromCatalog')
      : undefined;
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);

  const set = <K extends keyof typeof v>(field: K, value: (typeof v)[K]) => {
    setV((c) => ({ ...c, [field]: value }));
    setErrors((c) => {
      const rest = { ...c };
      delete rest[field];
      return rest;
    });
  };
  const err = (f: string) => (errors[f] ? t(`admin.${errors[f]}`) : undefined);
  const setPriceField = (field: keyof typeof price, value: string) => {
    setPrice((c) => ({ ...c, [field]: value }));
    setErrors((c) => {
      const rest = { ...c };
      delete rest[field];
      delete rest[`price.${field}`];
      return rest;
    });
  };
  const priceErr = (f: string) => err(f) ?? err(`price.${f}`);
  const priceEntered = PRICE_FIELDS.some((f) => price[f].trim() !== '');

  function submit(event: FormEvent) {
    event.preventDefault();
    const context = integerError(v.contextWindow);
    const found = collect({
      ...(model
        ? {}
        : {
            providerCode: requiredError(v.providerCode),
            providerModelId: requiredError(v.providerModelId),
          }),
      displayName: requiredError(v.displayName),
      contextWindow: context,
      maxOutputTokens:
        integerError(v.maxOutputTokens) ??
        (!context &&
        parseInt(v.maxOutputTokens, 10) > parseInt(v.contextWindow, 10)
          ? 'models.maxOutputTooLarge'
          : null),
      marginOverridePct: v.marginOverridePct.trim()
        ? percentError(v.marginOverridePct)
        : null,
      ...(!model && priceEntered
        ? {
            inputPerMtok: price.inputPerMtok.trim()
              ? decimalError(price.inputPerMtok)
              : 'models.picker.priceIncomplete',
            outputPerMtok: price.outputPerMtok.trim()
              ? decimalError(price.outputPerMtok)
              : 'models.picker.priceIncomplete',
            cachedInputPerMtok: price.cachedInputPerMtok.trim()
              ? decimalError(price.cachedInputPerMtok)
              : null,
            cacheWritePerMtok: price.cacheWritePerMtok.trim()
              ? decimalError(price.cacheWritePerMtok)
              : null,
          }
        : {}),
    });
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  }

  const shared = {
    displayName: v.displayName.trim(),
    contextWindow: parseInt(v.contextWindow, 10),
    maxOutputTokens: parseInt(v.maxOutputTokens, 10),
    marginOverridePct: v.marginOverridePct.trim() || null,
    thinking: v.thinking,
    supportsImages: v.supportsImages,
    isEnabled: v.isEnabled,
  };

  return (
    <>
      <form onSubmit={submit} noValidate>
        <Section title={t('admin.models.formTitle')}>
          <div className="grid gap-4 md:grid-cols-2">
            {model || locked ? (
              <>
                <div className="grid content-start gap-1">
                  <span className="text-fg-muted text-sm">
                    {t('admin.models.provider')}
                  </span>
                  <bdi dir="ltr" className="text-fg text-start">
                    {v.providerCode}
                  </bdi>
                </div>
                <div className="grid content-start gap-1">
                  <span className="text-fg-muted text-sm">
                    {t('admin.models.providerModelId')}
                  </span>
                  <span className="flex flex-wrap items-center gap-3">
                    <bdi dir="ltr" className="text-fg text-start">
                      {v.providerModelId}
                    </bdi>
                    {locked ? (
                      <Link
                        to="/admin/models/new"
                        search={{ provider: v.providerCode }}
                        className="text-brand focus-visible:outline-focus inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        {t('admin.models.picker.change')}
                      </Link>
                    ) : null}
                  </span>
                </div>
              </>
            ) : (
              <>
                {providers.isError ? (
                  <Alert variant="danger">{t('admin.providers.error')}</Alert>
                ) : (
                  <SelectField
                    label={t('admin.models.provider')}
                    required
                    value={v.providerCode}
                    disabled={providers.isPending}
                    error={err('providerCode')}
                    onChange={(x) => set('providerCode', x)}
                  >
                    <option value="">
                      {t('admin.models.providerPlaceholder')}
                    </option>
                    {providers.data?.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.displayName} ({p.code})
                      </option>
                    ))}
                  </SelectField>
                )}
                <TextField
                  label={t('admin.models.providerModelId')}
                  hint={t('admin.models.providerModelIdHint')}
                  required
                  dir="ltr"
                  autoComplete="off"
                  value={v.providerModelId}
                  error={err('providerModelId')}
                  onChange={(x) => set('providerModelId', x)}
                />
              </>
            )}
            <TextField
              label={t('admin.models.displayName')}
              hint={t('admin.models.displayNameHint')}
              required
              badge={fromCatalog('displayName', v.displayName)}
              value={v.displayName}
              error={err('displayName')}
              onChange={(x) => set('displayName', x)}
            />
            <SelectField
              label={t('admin.models.thinking')}
              hint={t('admin.models.thinkingHint')}
              value={v.thinking}
              onChange={(x) => set('thinking', x as ModelDto['thinking'])}
            >
              {THINKING.map((x) => (
                <option key={x} value={x}>
                  {t(`admin.models.thinkingOptions.${x}`)}
                </option>
              ))}
            </SelectField>
            <TextField
              label={t('admin.models.contextWindow')}
              required
              dir="ltr"
              inputMode="numeric"
              badge={fromCatalog('contextWindow', v.contextWindow)}
              value={v.contextWindow}
              error={err('contextWindow')}
              onChange={(x) => set('contextWindow', x)}
            />
            <TextField
              label={t('admin.models.maxOutput')}
              required
              dir="ltr"
              inputMode="numeric"
              badge={fromCatalog('maxOutputTokens', v.maxOutputTokens)}
              value={v.maxOutputTokens}
              error={err('maxOutputTokens')}
              onChange={(x) => set('maxOutputTokens', x)}
            />
            <TextField
              label={t('admin.models.marginOverride')}
              hint={t('admin.models.marginOverrideHint')}
              dir="ltr"
              inputMode="decimal"
              value={v.marginOverridePct}
              error={err('marginOverridePct')}
              onChange={(x) => set('marginOverridePct', x)}
            />
          </div>
          <CheckField
            label={t('admin.models.supportsImages')}
            badge={fromCatalog('supportsImages', v.supportsImages)}
            description={t('admin.models.supportsImagesHint')}
            checked={v.supportsImages}
            onChange={(x) => set('supportsImages', x)}
          />
          <CheckField
            label={t('admin.catalog.enabled')}
            description={t('admin.models.enabledHint')}
            checked={v.isEnabled}
            onChange={(x) => set('isEnabled', x)}
          />
          {model ? null : (
            <p className="text-fg-muted text-sm">
              {t('admin.models.picker.createdNote')}
            </p>
          )}
          {model ? (
            <div className="flex justify-end">
              <Button type="submit">{t('admin.catalog.save')}</Button>
            </div>
          ) : null}
        </Section>

        {model ? null : (
          <div className="mt-6 grid gap-6">
            <Section title={t('admin.models.picker.initialPriceTitle')}>
              <p className="text-fg-muted text-sm">
                {t('admin.models.picker.initialPriceHint')}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {(
                  [
                    ['inputPerMtok', 'admin.models.inputPrice', true],
                    ['outputPerMtok', 'admin.models.outputPrice', true],
                    ['cachedInputPerMtok', 'admin.models.cachedPrice', false],
                    [
                      'cacheWritePerMtok',
                      'admin.models.cacheWritePrice',
                      false,
                    ],
                  ] as const
                ).map(([field, label, required]) => (
                  <TextField
                    key={field}
                    label={t(label)}
                    required={required && priceEntered}
                    badge={fromCatalog(field, price[field])}
                    dir="ltr"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={t('admin.models.picker.optional')}
                    value={price[field]}
                    error={priceErr(field)}
                    onChange={(x) => setPriceField(field, x)}
                  />
                ))}
              </div>
            </Section>

            {initial?.hasContextTiers ? (
              <Section title={t('admin.models.picker.catalogTitle')}>
                <Alert variant="warning">
                  {t('admin.models.picker.tiersWarning')}
                </Alert>
              </Section>
            ) : null}

            {initial?.deprecated ? (
              <Alert variant="warning">
                {t('admin.models.picker.deprecatedWarning')}
              </Alert>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3">
              <Link
                to="/admin/models"
                className={cn(buttonVariants({ variant: 'secondary' }))}
              >
                {t('admin.common.cancel')}
              </Link>
              <Button type="submit">{t('admin.models.createSubmit')}</Button>
            </div>
          </div>
        )}
      </form>

      {confirming ? (
        <ReasonDialog
          open
          onOpenChange={setConfirming}
          title={t(
            model ? 'admin.models.saveTitle' : 'admin.models.createTitle',
          )}
          description={model?.displayName ?? v.displayName.trim()}
          submitLabel={t(
            model ? 'admin.catalog.save' : 'admin.models.createSubmit',
          )}
          onSubmit={async ({ reason }) => {
            let id = model?.id;
            try {
              if (model) {
                await update.mutateAsync({
                  path: { id: model.id },
                  body: { reason, ...shared },
                });
              } else {
                const created = await create.mutateAsync({
                  body: {
                    reason,
                    providerCode: v.providerCode,
                    providerModelId: v.providerModelId.trim(),
                    ...shared,
                    // One call: the model and its first price share a
                    // transaction and one audit entry.
                    ...(priceEntered
                      ? {
                          price: {
                            inputPerMtok: price.inputPerMtok.trim(),
                            outputPerMtok: price.outputPerMtok.trim(),
                            cachedInputPerMtok:
                              price.cachedInputPerMtok.trim() || null,
                            cacheWritePerMtok:
                              price.cacheWritePerMtok.trim() || null,
                          },
                        }
                      : {}),
                  },
                });
                id = created.id;
              }
            } catch (error) {
              const fields = serverFieldErrors(error);
              if (fields) setErrors(fields);
              throw error;
            }
            await invalidateCatalog(queryClient);
            toast.success(
              t(model ? 'admin.models.saved' : 'admin.models.created'),
            );
            if (!model && id) {
              void navigate({ to: '/admin/models/$id', params: { id } });
            }
          }}
        />
      ) : null}
    </>
  );
}
