import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminChatSettingsControllerGetOptions,
  adminChatSettingsControllerUpdateMutation,
  adminPricingSettingsControllerGetOptions,
  adminPricingSettingsControllerGetQueryKey,
  adminPricingSettingsControllerUpdateMutation,
  adminChatSettingsControllerGetQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';
import { Button } from '~/components/ui/button';
import { TextAreaField, TextField } from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { QueryState } from '../../catalog/components/CatalogParts';
import {
  collect,
  percentError,
  serverFieldErrors,
  type Errors,
} from '../../catalog/model/form';

export const MAX_PROMPT = 10_000;

function MarginForm({ initial }: { initial: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminPricingSettingsControllerUpdateMutation());
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);
  const error = errors.defaultMarginPct
    ? t(`admin.${errors.defaultMarginPct}`)
    : undefined;

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = collect({ defaultMarginPct: percentError(value) });
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  }

  return (
    <form onSubmit={submit} noValidate>
      <Section title={t('admin.settings.marginTitle')}>
        <p className="text-fg-muted text-sm">
          {t('admin.settings.marginBody')}
        </p>
        <div className="max-w-xs">
          <TextField
            label={t('admin.settings.marginLabel')}
            hint={t('admin.settings.marginHint')}
            required
            dir="ltr"
            inputMode="decimal"
            value={value}
            error={error}
            onChange={(x) => {
              setValue(x);
              setErrors({});
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">{t('admin.catalog.save')}</Button>
        </div>
        {confirming ? (
          <ReasonDialog
            open
            onOpenChange={setConfirming}
            title={t('admin.settings.marginConfirm')}
            description={t('admin.settings.marginConfirmBody')}
            submitLabel={t('admin.catalog.save')}
            onSubmit={async ({ reason }) => {
              try {
                await mutation.mutateAsync({
                  body: { reason, defaultMarginPct: value.trim() },
                });
              } catch (e) {
                const fields = serverFieldErrors(e);
                if (fields) setErrors(fields);
                throw e;
              }
              await queryClient.invalidateQueries({
                queryKey: adminPricingSettingsControllerGetQueryKey(),
              });
              // Prices shown in the catalog include the margin.
              await queryClient.invalidateQueries({
                predicate: (q) =>
                  /^(adminModels|modesController)/.test(
                    (q.queryKey[0] as { _id?: string })._id ?? '',
                  ),
              });
              toast.success(t('admin.settings.saved'));
            }}
          />
        ) : null}
      </Section>
    </form>
  );
}

function PromptForm({ initial }: { initial: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminChatSettingsControllerUpdateMutation());
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);
  const error = errors.defaultSystemPrompt
    ? t(`admin.${errors.defaultSystemPrompt}`)
    : undefined;

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = collect({
      defaultSystemPrompt:
        value.trim() === ''
          ? 'settings.promptRequired'
          : value.length > MAX_PROMPT
            ? 'settings.promptTooLong'
            : null,
    });
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  }

  return (
    <form onSubmit={submit} noValidate>
      <Section title={t('admin.settings.promptTitle')}>
        <p className="text-fg-muted text-sm">
          {t('admin.settings.promptBody')}
        </p>
        <TextAreaField
          label={t('admin.settings.promptLabel')}
          rows={10}
          maxLength={MAX_PROMPT}
          value={value}
          error={error}
          counter={t('admin.settings.promptCounter', {
            count: value.length,
            max: MAX_PROMPT,
          })}
          onChange={(x) => {
            setValue(x);
            setErrors({});
          }}
        />
        <div className="flex justify-end">
          <Button type="submit">{t('admin.catalog.save')}</Button>
        </div>
        {confirming ? (
          <ReasonDialog
            open
            onOpenChange={setConfirming}
            title={t('admin.settings.promptConfirm')}
            description={t('admin.settings.promptConfirmBody')}
            submitLabel={t('admin.catalog.save')}
            onSubmit={async ({ reason }) => {
              try {
                await mutation.mutateAsync({
                  body: { reason, defaultSystemPrompt: value },
                });
              } catch (e) {
                const fields = serverFieldErrors(e);
                if (fields) setErrors(fields);
                throw e;
              }
              await queryClient.invalidateQueries({
                queryKey: adminChatSettingsControllerGetQueryKey(),
              });
              toast.success(t('admin.settings.saved'));
            }}
          />
        ) : null}
      </Section>
    </form>
  );
}

/** A7: default margin and default system prompt. */
export function SettingsPage() {
  const { t } = useTranslation();
  const pricing = useQuery(adminPricingSettingsControllerGetOptions());
  const chat = useQuery(adminChatSettingsControllerGetOptions());
  return (
    <>
      <QueryState query={pricing} error={t('admin.settings.marginError')}>
        {pricing.data ? (
          <MarginForm
            key={pricing.data.updatedAt}
            initial={pricing.data.defaultMarginPct}
          />
        ) : null}
      </QueryState>
      <QueryState query={chat} error={t('admin.settings.promptError')}>
        {chat.data ? (
          <PromptForm
            key={chat.data.updatedAt}
            initial={chat.data.defaultSystemPrompt}
          />
        ) : null}
      </QueryState>
    </>
  );
}
