import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminModesControllerCreateMutation,
  adminModesControllerUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import type { AdminModeDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  CheckField,
  SelectField,
  TextAreaField,
  TextField,
} from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import {
  collect,
  keyError,
  requiredError,
  serverFieldErrors,
  sortError,
  type Errors,
} from '../model/form';
import { invalidateCatalog, useModels } from '../model/queries';
import { MAX_PROMPT } from '../../settings/pages/SettingsPage';

/** Create (no `mode`) or edit one mode. */
export function ModeForm({ mode }: { mode?: AdminModeDto }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const models = useModels();
  const create = useMutation(adminModesControllerCreateMutation());
  const update = useMutation(adminModesControllerUpdateMutation());
  const [v, setV] = useState({
    key: mode?.key ?? '',
    labelAr: mode?.labelAr ?? '',
    labelEn: mode?.labelEn ?? '',
    descriptionAr: mode?.descriptionAr ?? '',
    descriptionEn: mode?.descriptionEn ?? '',
    modelId: mode?.model?.id ?? '',
    systemPrompt: mode?.systemPrompt ?? '',
    sortOrder: String(mode?.sortOrder ?? 0),
    isEnabled: mode?.isEnabled ?? false,
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
    const found = collect({
      ...(mode ? {} : { key: keyError(v.key) }),
      labelAr: requiredError(v.labelAr),
      labelEn: requiredError(v.labelEn),
      descriptionAr: requiredError(v.descriptionAr),
      descriptionEn: requiredError(v.descriptionEn),
      sortOrder: sortError(v.sortOrder),
      systemPrompt:
        v.systemPrompt.length > MAX_PROMPT ? 'settings.promptTooLong' : null,
      modelId: v.isEnabled && !v.modelId ? 'modes.modelRequiredToEnable' : null,
    });
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  }

  const shared = {
    labelAr: v.labelAr.trim(),
    labelEn: v.labelEn.trim(),
    descriptionAr: v.descriptionAr.trim(),
    descriptionEn: v.descriptionEn.trim(),
    sortOrder: parseInt(v.sortOrder, 10),
    modelId: v.modelId || null,
    // Empty = use the default prompt from settings.
    systemPrompt: v.systemPrompt.trim() === '' ? null : v.systemPrompt,
  };

  return (
    <>
      <form onSubmit={submit} noValidate>
        <Section title={t('admin.modes.formTitle')}>
          <div className="grid gap-4 md:grid-cols-2">
            {mode ? (
              <div className="grid content-start gap-1 md:col-span-2">
                <span className="text-fg-muted text-sm">
                  {t('admin.modes.key')}
                </span>
                <bdi dir="ltr" className="text-fg text-start">
                  {mode.key}
                </bdi>
              </div>
            ) : (
              <div className="md:col-span-2">
                <TextField
                  label={t('admin.modes.key')}
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
              label={t('admin.catalog.labelAr')}
              required
              value={v.labelAr}
              error={err('labelAr')}
              onChange={(x) => set('labelAr', x)}
            />
            <TextField
              label={t('admin.catalog.labelEn')}
              required
              dir="ltr"
              value={v.labelEn}
              error={err('labelEn')}
              onChange={(x) => set('labelEn', x)}
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
            {models.isError ? (
              <Alert variant="danger">{t('admin.models.error')}</Alert>
            ) : (
              <SelectField
                label={t('admin.modes.model')}
                hint={t('admin.modes.modelHint')}
                value={v.modelId}
                disabled={models.isPending}
                error={err('modelId')}
                onChange={(x) => set('modelId', x)}
              >
                <option value="">{t('admin.modes.noModelOption')}</option>
                {models.data?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName} ({m.providerCode})
                  </option>
                ))}
              </SelectField>
            )}
            <TextField
              label={t('admin.catalog.sortOrder')}
              required
              dir="ltr"
              inputMode="numeric"
              value={v.sortOrder}
              error={err('sortOrder')}
              onChange={(x) => set('sortOrder', x)}
            />
            <div className="md:col-span-2">
              <TextAreaField
                label={t('admin.modes.systemPrompt')}
                hint={t('admin.modes.systemPromptHint')}
                rows={6}
                counter={t('admin.settings.promptCounter', {
                  count: v.systemPrompt.length,
                  max: MAX_PROMPT,
                })}
                value={v.systemPrompt}
                error={err('systemPrompt')}
                onChange={(x) => set('systemPrompt', x)}
              />
            </div>
          </div>
          {mode ? (
            <CheckField
              label={t('admin.catalog.enabled')}
              description={t('admin.modes.enabledHint')}
              checked={v.isEnabled}
              onChange={(x) => set('isEnabled', x)}
            />
          ) : null}
          <div className="flex justify-end">
            <Button type="submit">
              {t(mode ? 'admin.catalog.save' : 'admin.modes.createSubmit')}
            </Button>
          </div>
        </Section>
      </form>

      {confirming ? (
        <ReasonDialog
          open
          onOpenChange={setConfirming}
          title={t(mode ? 'admin.modes.saveTitle' : 'admin.modes.createTitle')}
          description={mode ? mode.key : v.key.trim()}
          submitLabel={t(
            mode ? 'admin.catalog.save' : 'admin.modes.createSubmit',
          )}
          onSubmit={async ({ reason }) => {
            try {
              if (mode) {
                await update.mutateAsync({
                  path: { key: mode.key },
                  body: { reason, ...shared, isEnabled: v.isEnabled },
                });
              } else {
                await create.mutateAsync({
                  body: { reason, key: v.key.trim(), ...shared },
                });
              }
            } catch (error) {
              const fields = serverFieldErrors(error);
              if (fields) setErrors(fields);
              throw error;
            }
            await invalidateCatalog(queryClient);
            toast.success(
              t(mode ? 'admin.modes.saved' : 'admin.modes.created'),
            );
            if (!mode) {
              void navigate({
                to: '/admin/modes/$key',
                params: { key: v.key.trim() },
              });
            }
          }}
        />
      ) : null}
    </>
  );
}
