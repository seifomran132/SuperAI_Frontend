import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminProvidersControllerCreateMutation,
  adminProvidersControllerRemoveApiKeyMutation,
  adminProvidersControllerUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import { adminProvidersControllerSetApiKey } from '~/api/generated/sdk.gen';
import type { ProviderDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { PasswordInput } from '~/components/ui/password-input';
import { th, td, TextField } from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import {
  FlagBadge,
  Ltr,
  QueryState,
  TableCard,
} from '../components/CatalogParts';
import {
  collect,
  keyError,
  requiredError,
  serverFieldErrors,
  type Errors,
} from '../model/form';
import { invalidateCatalog, useProviders } from '../model/queries';
import { Field, describedBy } from '../../components/Field';
import { useId } from 'react';

type Dialog =
  | { kind: 'add' }
  | { kind: 'setKey' | 'removeKey' | 'toggle'; provider: ProviderDto };

const BASE_URL = /^https?:\/\/\S+$/i;

function SetKeyDialog({
  provider,
  onClose,
}: {
  provider: ProviderDto;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const queryClient = useQueryClient();
  // Held only while the dialog is open; cleared as soon as it is sent.
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | undefined>();
  return (
    <ReasonDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('admin.providers.setKeyTitle')}
      description={provider.displayName}
      submitLabel={t('admin.providers.setKeySubmit')}
      validate={() => {
        const key = apiKey.trim();
        const problem =
          key === ''
            ? 'providers.keyRequired'
            : key.length < 8 || key.length > 500 || /\s/.test(key)
              ? 'providers.keyInvalidFormat'
              : null;
        setError(problem ? t(`admin.${problem}`) : undefined);
        return (problem ? { apiKey: problem } : {}) as Record<string, string>;
      }}
      fields={() => (
        <Field
          id={id}
          label={t('admin.providers.keyLabel')}
          hint={t('admin.providers.keyHint')}
          required
          error={error}
        >
          <PasswordInput
            id={id}
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, true, Boolean(error))}
            onChange={(event) => {
              setApiKey(event.target.value);
              setError(undefined);
            }}
          />
        </Field>
      )}
      onSubmit={async ({ reason }) => {
        const key = apiKey.trim();
        setApiKey('');
        // Called directly (not useMutation): the key must not end up in the MutationCache.
        await adminProvidersControllerSetApiKey({
          path: { code: provider.code },
          body: { reason, apiKey: key },
          throwOnError: true,
        });
        await invalidateCatalog(queryClient);
        toast.success(t('admin.providers.keySaved'));
      }}
    />
  );
}

function RemoveKeyDialog({
  provider,
  onClose,
}: {
  provider: ProviderDto;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminProvidersControllerRemoveApiKeyMutation());
  return (
    <ReasonDialog
      open
      danger
      onOpenChange={(open) => !open && onClose()}
      title={t('admin.providers.removeKeyTitle')}
      description={provider.displayName}
      submitLabel={t('admin.providers.removeKeySubmit')}
      notice={
        <Alert variant="warning">{t('admin.providers.removeKeyWarning')}</Alert>
      }
      onSubmit={async ({ reason }) => {
        await mutation.mutateAsync({
          path: { code: provider.code },
          body: { reason },
        });
        await invalidateCatalog(queryClient);
        toast.success(t('admin.providers.keyRemoved'));
      }}
    />
  );
}

function ToggleDialog({
  provider,
  onClose,
}: {
  provider: ProviderDto;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminProvidersControllerUpdateMutation());
  const enabling = !provider.isEnabled;
  return (
    <ReasonDialog
      open
      danger={!enabling}
      onOpenChange={(open) => !open && onClose()}
      title={t(
        enabling
          ? 'admin.providers.enableTitle'
          : 'admin.providers.disableTitle',
      )}
      description={provider.displayName}
      submitLabel={t(
        enabling ? 'admin.catalog.enable' : 'admin.catalog.disable',
      )}
      onSubmit={async ({ reason }) => {
        await mutation.mutateAsync({
          path: { code: provider.code },
          body: { reason, isEnabled: enabling },
        });
        await invalidateCatalog(queryClient);
        toast.success(
          t(enabling ? 'admin.providers.enabled' : 'admin.providers.disabled'),
        );
      }}
    />
  );
}

function AddProviderDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminProvidersControllerCreateMutation());
  const [v, setV] = useState({ code: '', displayName: '', baseUrl: '' });
  const [errors, setErrors] = useState<Errors>({});
  const set = (field: keyof typeof v, value: string) => {
    setV((c) => ({ ...c, [field]: value }));
    setErrors((c) => {
      const rest = { ...c };
      delete rest[field];
      return rest;
    });
  };
  const err = (f: string) => (errors[f] ? t(`admin.${errors[f]}`) : undefined);
  return (
    <ReasonDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('admin.providers.addTitle')}
      description={t('admin.providers.addDescription')}
      submitLabel={t('admin.providers.addSubmit')}
      validate={() => {
        const found = collect({
          code: keyError(v.code),
          displayName: requiredError(v.displayName),
          baseUrl: BASE_URL.test(v.baseUrl.trim())
            ? null
            : 'providers.baseUrlInvalid',
        });
        setErrors(found);
        return found;
      }}
      fields={() => (
        <>
          <TextField
            label={t('admin.providers.code')}
            hint={t('admin.catalog.keyHint')}
            required
            dir="ltr"
            autoComplete="off"
            value={v.code}
            error={err('code')}
            onChange={(x) => set('code', x)}
          />
          <TextField
            label={t('admin.providers.displayName')}
            required
            value={v.displayName}
            error={err('displayName')}
            onChange={(x) => set('displayName', x)}
          />
          <TextField
            label={t('admin.providers.baseUrl')}
            hint={t('admin.providers.baseUrlHint')}
            required
            dir="ltr"
            type="url"
            autoComplete="off"
            value={v.baseUrl}
            error={err('baseUrl')}
            onChange={(x) => set('baseUrl', x)}
          />
        </>
      )}
      onSubmit={async ({ reason }) => {
        try {
          await mutation.mutateAsync({
            body: {
              reason,
              code: v.code.trim(),
              displayName: v.displayName.trim(),
              baseUrl: v.baseUrl.trim(),
            },
          });
        } catch (error) {
          const fields = serverFieldErrors(error);
          if (fields) setErrors(fields);
          throw error;
        }
        await invalidateCatalog(queryClient);
        toast.success(t('admin.providers.added'));
      }}
    />
  );
}

/** A4: providers, their keys and the OpenAI-compatible provider form. */
export function ProvidersPage() {
  const { t } = useTranslation();
  const providers = useProviders();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const close = () => setDialog(null);
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ kind: 'add' })}>
          <Plus aria-hidden="true" className="size-5" />
          {t('admin.providers.add')}
        </Button>
      </div>
      <QueryState query={providers} error={t('admin.providers.error')}>
        <TableCard
          empty={
            providers.data?.length === 0
              ? {
                  title: t('admin.providers.emptyTitle'),
                  body: t('admin.providers.emptyBody'),
                }
              : null
          }
        >
          <table
            aria-label={t('admin.providers.tableLabel')}
            className="w-full min-w-[960px] border-collapse"
          >
            <thead className="bg-surface-muted">
              <tr>
                <th scope="col" className={th}>
                  {t('admin.providers.columns.provider')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.providers.columns.kind')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.providers.columns.baseUrl')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.providers.columns.status')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.providers.columns.key')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.providers.columns.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {providers.data?.map((p) => (
                <tr key={p.code}>
                  <td className={td}>
                    <div className="font-semibold">{p.displayName}</div>
                    <div className="text-fg-muted text-xs">
                      <Ltr>{p.code}</Ltr>
                    </div>
                  </td>
                  <td className={td}>
                    <Ltr>{p.kind}</Ltr>
                  </td>
                  <td className={td}>
                    {p.baseUrl ? (
                      <Ltr>{p.baseUrl}</Ltr>
                    ) : (
                      t('admin.common.none')
                    )}
                  </td>
                  <td className={td}>
                    <FlagBadge
                      on={p.isEnabled}
                      onLabel={t('admin.catalog.enabled')}
                      offLabel={t('admin.catalog.disabled')}
                    />
                  </td>
                  <td className={td}>
                    {p.apiKey.configured ? (
                      <bdi dir="ltr">{`••••${p.apiKey.last4 ?? ''}`}</bdi>
                    ) : (
                      <span className="text-fg-muted">
                        {t('admin.providers.noKey')}
                      </span>
                    )}
                  </td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDialog({ kind: 'setKey', provider: p })
                        }
                      >
                        <KeyRound aria-hidden="true" className="size-4" />
                        {t(
                          p.apiKey.configured
                            ? 'admin.providers.replaceKey'
                            : 'admin.providers.setKey',
                        )}
                        <span className="sr-only"> {p.displayName}</span>
                      </Button>
                      {p.apiKey.configured ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setDialog({ kind: 'removeKey', provider: p })
                          }
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                          {t('admin.providers.removeKey')}
                          <span className="sr-only"> {p.displayName}</span>
                        </Button>
                      ) : null}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDialog({ kind: 'toggle', provider: p })
                        }
                      >
                        <Power aria-hidden="true" className="size-4" />
                        {t(
                          p.isEnabled
                            ? 'admin.catalog.disable'
                            : 'admin.catalog.enable',
                        )}
                        <span className="sr-only"> {p.displayName}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
      {dialog?.kind === 'add' ? <AddProviderDialog onClose={close} /> : null}
      {dialog?.kind === 'setKey' ? (
        <SetKeyDialog provider={dialog.provider} onClose={close} />
      ) : null}
      {dialog?.kind === 'removeKey' ? (
        <RemoveKeyDialog provider={dialog.provider} onClose={close} />
      ) : null}
      {dialog?.kind === 'toggle' ? (
        <ToggleDialog provider={dialog.provider} onClose={close} />
      ) : null}
    </>
  );
}
