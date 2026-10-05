import { Link, useParams } from '@tanstack/react-router';
import { Check, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import type { AdminModeDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Badge } from '../../components/Badge';
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
import { ModeForm } from '../components/ModeForm';
import { useMode, useModes } from '../model/queries';

function ReadyBadge({ mode }: { mode: AdminModeDto }) {
  const { t } = useTranslation();
  return mode.ready ? (
    <Badge tone="success" Icon={Check}>
      {t('admin.modes.ready')}
    </Badge>
  ) : (
    <Badge tone="warning" Icon={TriangleAlert}>
      {t('admin.modes.notReady')}
    </Badge>
  );
}

/** A6: modes list with readiness and the reason when not ready. */
export function ModesPage() {
  const { t, i18n } = useTranslation();
  const modes = useModes();
  const en = i18n.language === 'en';
  return (
    <>
      <NewLink to="/admin/modes/new" label={t('admin.modes.new')} />
      <QueryState query={modes} error={t('admin.modes.error')}>
        <TableCard
          empty={
            modes.data?.length === 0
              ? {
                  title: t('admin.modes.emptyTitle'),
                  body: t('admin.modes.emptyBody'),
                }
              : null
          }
        >
          <table
            aria-label={t('admin.modes.tableLabel')}
            className="w-full min-w-[900px] border-collapse"
          >
            <thead className="bg-surface-muted">
              <tr>
                {(['mode', 'ready', 'model', 'status', 'sort'] as const).map(
                  (c) => (
                    <th key={c} scope="col" className={th}>
                      {t(`admin.modes.columns.${c}`)}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {modes.data?.map((m) => (
                <tr key={m.key}>
                  <td className={td}>
                    <Link
                      to="/admin/modes/$key"
                      params={{ key: m.key }}
                      className="text-brand focus-visible:outline-focus font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {en ? m.labelEn : m.labelAr}
                    </Link>
                    <div className="text-fg-muted text-xs">
                      <Ltr>{m.key}</Ltr>
                    </div>
                  </td>
                  <td className={td}>
                    <ReadyBadge mode={m} />
                    {m.ready ? null : (
                      <p className="text-fg-muted mt-1 text-xs">
                        {t(`admin.modes.reasons.${m.notReadyReason}`)}
                      </p>
                    )}
                  </td>
                  <td className={td}>
                    {m.model ? (
                      <>
                        {m.model.displayName}
                        <div className="text-fg-muted text-xs">
                          <Ltr>{m.model.providerModelId}</Ltr>
                        </div>
                      </>
                    ) : (
                      t('admin.modes.noModel')
                    )}
                  </td>
                  <td className={td}>
                    <FlagBadge
                      on={m.isEnabled}
                      onLabel={t('admin.catalog.enabled')}
                      offLabel={t('admin.catalog.disabled')}
                    />
                  </td>
                  <td className={`${td} tabular-nums`}>{m.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
    </>
  );
}

export function ModeNewPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackLink to="/admin/modes" label={t('admin.modes.backToList')} />
      <ModeForm />
    </>
  );
}

export function ModeDetailPage() {
  const { t, i18n } = useTranslation();
  const { key } = useParams({ strict: false }) as { key: string };
  const query = useMode(key);
  if (
    query.isError &&
    isApiError(query.error) &&
    query.error.code === 'MODE_NOT_FOUND'
  ) {
    return (
      <NotFoundCard
        title={t('admin.modes.notFoundTitle')}
        body={t(errorMessageKey(query.error))}
        to="/admin/modes"
        back={t('admin.modes.backToList')}
      />
    );
  }
  const mode = query.data;
  return (
    <>
      <BackLink to="/admin/modes" label={t('admin.modes.backToList')} />
      <QueryState query={query} error={t('admin.modes.detailError')}>
        {mode ? (
          <>
            <h2 className="text-fg text-xl font-bold">
              {i18n.language === 'en' ? mode.labelEn : mode.labelAr}
            </h2>
            {mode.ready ? null : (
              <Alert variant="warning">
                <strong className="block">{t('admin.modes.notReady')}</strong>
                {t(`admin.modes.reasons.${mode.notReadyReason}`)}
              </Alert>
            )}
            <ModeForm key={`${mode.key}-${mode.updatedAt}`} mode={mode} />
          </>
        ) : null}
      </QueryState>
    </>
  );
}
