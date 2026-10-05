import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { Money } from '~/components/Money';
import { toDecimal } from '~/lib/money';
import { td, th } from '../../components/FormControls';
import {
  BackLink,
  FlagBadge,
  Ltr,
  NewLink,
  NotFoundCard,
  QueryState,
  TableCard,
} from '../components/CatalogParts';
import { ModelForm } from '../components/ModelForm';
import { ModelPrices } from '../components/ModelPrices';
import { ModelTest } from '../components/ModelTest';
import { useModel, useModeLabel, useModels } from '../model/queries';

const COLUMNS = [
  'model',
  'provider',
  'context',
  'margin',
  'status',
  'modes',
  'price',
] as const;

/** A5: models list. */
export function ModelsPage() {
  const { t } = useTranslation();
  const models = useModels();
  const modeLabel = useModeLabel();
  return (
    <>
      <NewLink to="/admin/models/new" label={t('admin.models.new')} />
      <QueryState query={models} error={t('admin.models.error')}>
        <TableCard
          empty={
            models.data?.length === 0
              ? {
                  title: t('admin.models.emptyTitle'),
                  body: t('admin.models.emptyBody'),
                }
              : null
          }
        >
          <table
            aria-label={t('admin.models.tableLabel')}
            className="w-full min-w-[900px] border-collapse"
          >
            <thead className="bg-surface-muted">
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c} scope="col" className={th}>
                    {t(`admin.models.columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {models.data?.map((m) => (
                <tr key={m.id}>
                  <td className={td}>
                    <Link
                      to="/admin/models/$id"
                      params={{ id: m.id }}
                      className="text-brand focus-visible:outline-focus font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {m.displayName}
                    </Link>
                    <div className="text-fg-muted text-xs">
                      <Ltr>{m.providerModelId}</Ltr>
                    </div>
                  </td>
                  <td className={td}>
                    <Ltr>{m.providerCode}</Ltr>
                  </td>
                  <td className={`${td} tabular-nums`}>
                    {m.contextWindow.toLocaleString('en')}
                  </td>
                  <td className={`${td} tabular-nums`}>
                    <bdi dir="ltr">
                      {toDecimal(m.effectiveMarginPct).toFixed()}%
                    </bdi>
                    <div className="text-fg-muted text-xs">
                      {m.marginOverridePct === null
                        ? t('admin.models.marginDefault')
                        : t('admin.models.marginOverrideShort')}
                    </div>
                  </td>
                  <td className={td}>
                    <FlagBadge
                      on={m.isEnabled}
                      onLabel={t('admin.catalog.enabled')}
                      offLabel={t('admin.catalog.disabled')}
                    />
                  </td>
                  <td className={td}>
                    {m.usedByModes.length === 0
                      ? t('admin.common.none')
                      : m.usedByModes.map(modeLabel).join('، ')}
                  </td>
                  <td className={td}>
                    {m.currentPrice ? (
                      <span className="grid gap-0.5">
                        <span>
                          {t('admin.models.inShort')}{' '}
                          <Money
                            value={m.currentPrice.inputPerMtok}
                            kind="exact"
                          />
                        </span>
                        <span>
                          {t('admin.models.outShort')}{' '}
                          <Money
                            value={m.currentPrice.outputPerMtok}
                            kind="exact"
                          />
                        </span>
                      </span>
                    ) : (
                      <span className="text-warning">
                        {t('admin.models.noPriceShort')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
    </>
  );
}

export function ModelNewPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackLink to="/admin/models" label={t('admin.models.backToList')} />
      <ModelForm />
    </>
  );
}

/** Edit, prices and the paid test. */
export function ModelDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams({ strict: false }) as { id: string };
  const query = useModel(id);
  if (
    query.isError &&
    isApiError(query.error) &&
    query.error.code === 'MODEL_NOT_FOUND'
  ) {
    return (
      <NotFoundCard
        title={t('admin.models.notFoundTitle')}
        body={t(errorMessageKey(query.error))}
        to="/admin/models"
        back={t('admin.models.backToList')}
      />
    );
  }
  const model = query.data;
  return (
    <>
      <BackLink to="/admin/models" label={t('admin.models.backToList')} />
      <QueryState query={query} error={t('admin.models.detailError')}>
        {model ? (
          <>
            <h2 className="text-fg text-xl font-bold">{model.displayName}</h2>
            <ModelForm key={`${model.id}-${model.updatedAt}`} model={model} />
            <ModelPrices model={model} />
            <ModelTest model={model} />
          </>
        ) : null}
      </QueryState>
    </>
  );
}
