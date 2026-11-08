import { useNavigate, useSearch } from '@tanstack/react-router';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';
import { RequestsPanel } from '../components/RequestsPanel';
import {
  requestsFilterOf,
  validateRequestsSearch,
  type RequestsFilter,
} from '../model/search';

// «الكل» first as in the board: no `status` filter; the page still opens on «مُعلَّمة».
const CHIPS: RequestsFilter[] = [
  'all',
  'reconciliation_required',
  'reserved',
  'settled',
  'released',
];

/** S19 «الطلبات المُعلَّمة»: billed requests, filtered by status in the URL. */
export function RequestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = validateRequestsSearch(useSearch({ strict: false }));
  const filter = requestsFilterOf(search);
  const setFilter = (next: RequestsFilter) =>
    void navigate({
      to: '/admin/requests',
      search: validateRequestsSearch({ status: next }),
      replace: true,
    });
  const flagged = filter === 'reconciliation_required';

  return (
    <>
      <p className="bg-surface-muted text-fg-muted border-border-subtle flex items-start gap-2 rounded-md border p-3 text-sm">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {t('admin.reports.requests.note')}
      </p>

      <div
        role="group"
        aria-label={t('admin.reports.requests.filterLabel')}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            aria-pressed={filter === chip}
            onClick={() => setFilter(chip)}
            className={cn(
              'min-h-11 shrink-0 rounded-md border px-4 text-sm',
              filter === chip
                ? 'border-brand bg-brand text-on-brand'
                : 'border-border-control text-fg bg-surface',
            )}
          >
            {t(`admin.reports.requests.chips.${chip}`)}
          </button>
        ))}
      </div>

      <section
        aria-label={t('admin.reports.requests.title')}
        className="bg-surface border-border-subtle overflow-hidden rounded-lg border"
      >
        <RequestsPanel
          // A new filter is a new list: reset paging and states.
          key={filter}
          filter={filter}
          label={t('admin.reports.requests.title')}
          emptyTitle={t(
            flagged
              ? 'admin.reports.requests.emptyFlagged'
              : 'admin.reports.requests.emptyOther',
          )}
          emptyBody={t(
            flagged
              ? 'admin.reports.requests.emptyFlaggedBody'
              : 'admin.reports.requests.emptyOtherBody',
          )}
          errorText={t('admin.reports.requests.error')}
        />
      </section>
    </>
  );
}
