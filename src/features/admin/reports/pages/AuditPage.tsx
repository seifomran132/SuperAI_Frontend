import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { EmptyNote } from '../../components/Section';
import { AuditFilters } from '../components/AuditFilters';
import { AuditList } from '../components/AuditList';
import { useAuditLog } from '../model/userReports';
import {
  hasAuditFilters,
  validateAuditSearch,
  type AuditSearch,
} from '../model/search';

/** S19 3a: the audit log, filters in the URL, newest first, «تحميل المزيد». */
export function AuditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = validateAuditSearch(useSearch({ strict: false }));
  const filtered = hasAuditFilters(search);
  const log = useAuditLog(search);
  const go = (next: AuditSearch) =>
    void navigate({
      to: '/admin/audit',
      search: validateAuditSearch({ ...next }),
      replace: true,
    });

  return (
    <>
      <AuditFilters
        // The URL is the source of truth: a cleared or edited URL resets the form.
        key={JSON.stringify(search)}
        value={search}
        onApply={go}
        onClear={() => go({})}
        canClear={filtered}
      />

      <section
        aria-label={t('admin.reports.audit.title')}
        className="bg-surface border-border-subtle overflow-hidden rounded-lg border"
      >
        {log.isPending ? (
          <p role="status" className="text-fg-muted p-10 text-center">
            {t('admin.reports.audit.loading')}
          </p>
        ) : log.isError && log.entries.length === 0 ? (
          <div className="p-4">
            <RetryAlert onRetry={() => void log.refetch()}>
              {t('admin.reports.audit.error')}
            </RetryAlert>
          </div>
        ) : log.entries.length === 0 ? (
          <div className="grid justify-items-center gap-2 pb-6">
            <EmptyNote
              title={t(
                filtered
                  ? 'admin.reports.audit.emptyFiltered'
                  : 'admin.reports.audit.empty',
              )}
              body={t(
                filtered
                  ? 'admin.reports.audit.emptyFilteredBody'
                  : 'admin.reports.audit.emptyBody',
              )}
            />
            {filtered ? (
              <Button type="button" variant="secondary" onClick={() => go({})}>
                {t('admin.reports.audit.filters.clear')}
              </Button>
            ) : null}
          </div>
        ) : (
          <div>
            <AuditList
              entries={log.entries}
              label={t('admin.reports.audit.title')}
            />
            {log.isError ? (
              <div className="p-4">
                <RetryAlert onRetry={() => void log.fetchNextPage()}>
                  {t('admin.reports.audit.loadMoreError')}
                </RetryAlert>
              </div>
            ) : null}
            {log.hasNextPage ? (
              <div className="border-border-subtle flex justify-center border-t p-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={log.isFetchingNextPage}
                  onClick={() => void log.fetchNextPage()}
                >
                  {t('admin.reports.audit.loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
