import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  Clock,
  Image as ImageIcon,
  Layers,
  Plus,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { adminProvidersAvailableModelsOptions } from '~/api/generated/@tanstack/react-query.gen';
import type {
  AvailableModelsDto,
  ProviderDto,
} from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import { Alert } from '~/components/ui/alert';
import { buttonVariants } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { Badge } from '../../components/Badge';
import { SelectField, td, th } from '../../components/FormControls';
import { rowFacts } from '../model/prefill';
import { useProviders } from '../model/queries';
import { Ltr, QueryState, TableCard } from './CatalogParts';

const textLink =
  'text-brand focus-visible:outline-focus inline-flex min-h-11 items-center gap-1 font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2';

/** The two steps of adding a model, as an ordered list (the current one is marked). */
export function Steps({ current }: { current: 1 | 2 }) {
  const { t } = useTranslation();
  const steps = ['stepPick', 'stepDetails'] as const;
  return (
    <ol
      aria-label={t('admin.models.picker.stepsLabel')}
      className="text-fg-muted flex flex-wrap items-center gap-3 text-sm"
    >
      {steps.map((key, index) => {
        const active = current === index + 1;
        return (
          <li
            key={key}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2',
              active && 'text-fg font-semibold',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs',
                active
                  ? 'bg-mode-1-container text-mode-1'
                  : 'bg-surface-muted text-fg-muted',
              )}
            >
              {index + 1}
            </span>
            {t(`admin.models.picker.${key}`)}
          </li>
        );
      })}
    </ol>
  );
}

/** Notice card used by the picker states (no key, rejected key, unreachable…). */
function PickerAlert({
  variant,
  title,
  body,
  children,
}: {
  variant: 'warning' | 'danger' | 'info';
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <Alert variant={variant} action={children}>
      <strong className="block">{title}</strong>
      {body ? <span className="font-normal">{body}</span> : null}
    </Alert>
  );
}

function ProvidersLink({ label }: { label: string }) {
  return (
    <Link to="/admin/providers" className={textLink}>
      {label}
    </Link>
  );
}

/** Table of the models one provider offers; picking a row goes to step 2. */
function AvailableModels({ provider }: { provider: ProviderDto }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const query = useQuery(
    adminProvidersAvailableModelsOptions({ path: { code: provider.code } }),
  );

  if (query.isPending) {
    return (
      <p role="status" className="text-fg-muted p-10 text-center">
        {t('admin.models.picker.loading')}
      </p>
    );
  }
  if (query.isError) {
    return <AvailableError error={query.error} onRetry={query.refetch} />;
  }
  return (
    <AvailableTable
      provider={provider.code}
      data={query.data}
      search={search}
      onSearch={setSearch}
    />
  );
}

export function AvailableError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => unknown;
}) {
  const { t } = useTranslation();
  const code = isApiError(error) ? error.code : null;
  const body = t(errorMessageKey(error));
  if (code === 'PROVIDER_KEY_MISSING') {
    return (
      <PickerAlert
        variant="warning"
        title={t('admin.models.picker.noKeyTitle')}
        body={body}
      >
        <ProvidersLink label={t('admin.models.picker.goProviders')} />
      </PickerAlert>
    );
  }
  if (code === 'PROVIDER_KEY_INVALID') {
    return (
      <PickerAlert
        variant="danger"
        title={t('admin.models.picker.keyInvalidTitle')}
        body={body}
      >
        <ProvidersLink label={t('admin.models.picker.replaceKey')} />
      </PickerAlert>
    );
  }
  if (code === 'PROVIDER_NOT_FOUND') {
    return (
      <PickerAlert
        variant="danger"
        title={t('admin.models.picker.notFoundTitle')}
        body={body}
      >
        <ProvidersLink label={t('admin.models.picker.backToProviders')} />
      </PickerAlert>
    );
  }
  if (code === 'PROVIDER_KEY_NOT_USED') {
    return <PickerAlert variant="info" title={body} />;
  }
  return (
    <RetryAlert onRetry={() => void onRetry()}>
      {t('admin.models.picker.unreachableTitle')}
    </RetryAlert>
  );
}

function AvailableTable({
  provider,
  data,
  search,
  onSearch,
}: {
  provider: string;
  data: AvailableModelsDto;
  search: string;
  onSearch: (value: string) => void;
}) {
  const { t } = useTranslation();
  const none = t('admin.common.none');
  const q = search.trim().toLowerCase();
  const rows = data.models.filter((m) => {
    if (!q) return true;
    const name = rowFacts(m).name ?? '';
    return (
      m.providerModelId.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q)
    );
  });
  const columns = ['id', 'name', 'context', 'maxOutput', 'input', 'output'];
  return (
    <>
      {data.catalogAvailable ? null : (
        <Alert variant="warning">
          {t('admin.models.picker.catalogUnavailable')}
        </Alert>
      )}
      <label className="grid gap-2">
        <span className="text-fg text-sm font-medium">
          {t('admin.models.picker.search')}
        </span>
        <span className="relative block">
          <Search
            aria-hidden="true"
            className="text-fg-muted pointer-events-none absolute inset-y-0 end-3 my-auto size-5"
          />
          <Input
            type="search"
            value={search}
            placeholder={t('admin.models.picker.searchPlaceholder')}
            onChange={(event) => onSearch(event.target.value)}
            className="pe-11"
          />
        </span>
      </label>
      <TableCard
        empty={
          rows.length === 0
            ? data.models.length === 0
              ? {
                  title: t('admin.models.picker.emptyListTitle'),
                  body: t('admin.models.picker.emptyListBody'),
                }
              : {
                  title: t('admin.models.picker.emptyTitle'),
                  body: t('admin.models.picker.emptyBody'),
                }
            : null
        }
      >
        <table
          aria-label={t('admin.models.picker.tableLabel')}
          className="w-full min-w-[960px] border-collapse"
        >
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className={th}>
                  {t(`admin.models.picker.columns.${c}`)}
                  {c === 'input' || c === 'output' ? (
                    <span className="block text-xs font-normal">
                      {t('admin.models.picker.columns.perMillion')}
                    </span>
                  ) : null}
                </th>
              ))}
              <th scope="col" className={th}>
                {t('admin.models.picker.columns.notes')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-border-subtle divide-y">
            {rows.map((m) => {
              const f = rowFacts(m);
              const added = m.addedModelId !== null;
              return (
                <tr
                  key={m.providerModelId}
                  aria-disabled={added || undefined}
                  className={added ? 'bg-surface-muted' : undefined}
                >
                  <td className={td}>
                    {added ? (
                      <Ltr>{m.providerModelId}</Ltr>
                    ) : (
                      <Link
                        to="/admin/models/new"
                        search={{ provider, model: m.providerModelId }}
                        aria-label={t('admin.models.picker.select', {
                          id: m.providerModelId,
                        })}
                        className={cn(textLink, 'font-bold')}
                      >
                        <Ltr>{m.providerModelId}</Ltr>
                      </Link>
                    )}
                  </td>
                  <td className={td}>{f.name ?? none}</td>
                  <td className={`${td} tabular-nums`}>
                    {f.contextWindow?.toLocaleString('en') ?? none}
                  </td>
                  <td className={`${td} tabular-nums`}>
                    {f.maxOutputTokens?.toLocaleString('en') ?? none}
                  </td>
                  <td className={td}>
                    {f.inputPerMtok ? (
                      <Money value={f.inputPerMtok} kind="exact" />
                    ) : (
                      none
                    )}
                  </td>
                  <td className={td}>
                    {f.outputPerMtok ? (
                      <Money value={f.outputPerMtok} kind="exact" />
                    ) : (
                      none
                    )}
                  </td>
                  <td className={td}>
                    <div className="flex flex-wrap items-center gap-2">
                      {added ? (
                        <>
                          <Badge tone="success" Icon={Check}>
                            {t('admin.models.picker.added')}
                          </Badge>
                          <Link
                            to="/admin/models/$id"
                            params={{ id: m.addedModelId ?? '' }}
                            className={textLink}
                          >
                            {t('admin.models.picker.viewModel')}
                          </Link>
                        </>
                      ) : null}
                      {m.catalog?.supportsImages ? (
                        <Badge tone="neutral" Icon={ImageIcon}>
                          {t('admin.models.picker.images')}
                        </Badge>
                      ) : null}
                      {m.catalog?.hasContextTiers ? (
                        <Badge tone="warning" Icon={Layers}>
                          {t('admin.models.picker.tiered')}
                        </Badge>
                      ) : null}
                      {m.catalog?.deprecated ? (
                        <Badge tone="warning" Icon={Clock}>
                          {t('admin.models.picker.deprecated')}
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>
      <p className="text-fg-muted text-sm">{t('admin.models.picker.hint')}</p>
    </>
  );
}

/** Step 1: choose a provider, then one of the models it offers (or enter one by hand). */
export function ModelPicker({ provider }: { provider?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const providers = useProviders();
  // The mock provider has no key and nothing to discover.
  const choices = providers.data?.filter((p) => p.kind !== 'mock') ?? [];
  const selected = choices.find((p) => p.code === provider);

  return (
    <QueryState query={providers} error={t('admin.providers.error')}>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1">
          <SelectField
            label={t('admin.models.picker.provider')}
            value={selected?.code ?? ''}
            onChange={(code) =>
              void navigate({
                to: '/admin/models/new',
                search: code ? { provider: code } : {},
                replace: true,
              })
            }
          >
            <option value="">
              {t('admin.models.picker.providerPlaceholder')}
            </option>
            {choices.map((p) => (
              <option key={p.code} value={p.code}>
                {p.displayName} ({p.code})
              </option>
            ))}
          </SelectField>
        </div>
        <Link
          to="/admin/models/new"
          search={{
            ...(selected ? { provider: selected.code } : {}),
            manual: true,
          }}
          className={cn(buttonVariants({ variant: 'secondary' }), 'mb-px')}
        >
          <Plus aria-hidden="true" className="size-5" />
          {t('admin.models.picker.manual')}
        </Link>
      </div>

      {choices.length === 0 ? (
        <PickerAlert
          variant="warning"
          title={t('admin.models.picker.noProviders')}
        >
          <ProvidersLink label={t('admin.models.picker.goProviders')} />
        </PickerAlert>
      ) : !selected ? (
        <p className="text-fg-muted py-6 text-center">
          {t('admin.models.picker.chooseProvider')}
        </p>
      ) : !selected.apiKey.configured ? (
        // No call is made without a key.
        <PickerAlert
          variant="warning"
          title={t('admin.models.picker.noKeyTitle')}
          body={t('admin.models.picker.noKeyBody')}
        >
          <ProvidersLink label={t('admin.models.picker.goProviders')} />
        </PickerAlert>
      ) : (
        <AvailableModels key={selected.code} provider={selected} />
      )}
    </QueryState>
  );
}
