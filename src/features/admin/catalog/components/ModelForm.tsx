import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminModelsControllerCreateMutation,
  adminModelsControllerUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import type { ModelDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  CheckField,
  SelectField,
  TextField,
} from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import {
  collect,
  integerError,
  percentError,
  requiredError,
  serverFieldErrors,
  type Errors,
} from '../model/form';
import { invalidateCatalog, useProviders } from '../model/queries';

export const THINKING = ['off', 'low', 'default'] as const;

/** Create (no `model`) or edit one model. Provider and provider model id are fixed after creation. */
export function ModelForm({ model }: { model?: ModelDto }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const providers = useProviders();
  const create = useMutation(adminModelsControllerCreateMutation());
  const update = useMutation(adminModelsControllerUpdateMutation());
  const [v, setV] = useState({
    providerCode: model?.providerCode ?? '',
    providerModelId: model?.providerModelId ?? '',
    displayName: model?.displayName ?? '',
    contextWindow: String(model?.contextWindow ?? ''),
    maxOutputTokens: String(model?.maxOutputTokens ?? ''),
    marginOverridePct: model?.marginOverridePct ?? '',
    thinking: model?.thinking ?? ('default' as ModelDto['thinking']),
    isEnabled: model?.isEnabled ?? false,
  });
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
    isEnabled: v.isEnabled,
  };

  return (
    <>
      <form onSubmit={submit} noValidate>
        <Section title={t('admin.models.formTitle')}>
          <div className="grid gap-4 md:grid-cols-2">
            {model ? (
              <>
                <div className="grid content-start gap-1">
                  <span className="text-fg-muted text-sm">
                    {t('admin.models.provider')}
                  </span>
                  <bdi dir="ltr" className="text-fg text-start">
                    {model.providerCode}
                  </bdi>
                </div>
                <div className="grid content-start gap-1">
                  <span className="text-fg-muted text-sm">
                    {t('admin.models.providerModelId')}
                  </span>
                  <bdi dir="ltr" className="text-fg text-start">
                    {model.providerModelId}
                  </bdi>
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
              value={v.contextWindow}
              error={err('contextWindow')}
              onChange={(x) => set('contextWindow', x)}
            />
            <TextField
              label={t('admin.models.maxOutput')}
              required
              dir="ltr"
              inputMode="numeric"
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
            label={t('admin.catalog.enabled')}
            description={t('admin.models.enabledHint')}
            checked={v.isEnabled}
            onChange={(x) => set('isEnabled', x)}
          />
          <div className="flex justify-end">
            <Button type="submit">
              {t(model ? 'admin.catalog.save' : 'admin.models.createSubmit')}
            </Button>
          </div>
        </Section>
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
