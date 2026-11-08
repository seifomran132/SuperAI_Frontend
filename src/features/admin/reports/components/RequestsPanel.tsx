import { useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { EmptyNote } from '../../components/Section';
import { useChatRequests } from '../model/userReports';
import type { RequestsFilter } from '../model/search';
import { RequestsList } from './RequestsList';

/** Paged list of billed requests with its loading, empty and error states. */
export function RequestsPanel({
  filter,
  userId,
  label,
  emptyTitle,
  emptyBody,
  errorText,
}: {
  filter: RequestsFilter;
  userId?: string;
  label: string;
  emptyTitle: string;
  emptyBody?: string;
  errorText: string;
}) {
  const { t } = useTranslation();
  const list = useChatRequests({ userId, status: filter });

  if (list.isPending) {
    return (
      <p role="status" className="text-fg-muted p-10 text-center">
        {t('admin.reports.requests.loading')}
      </p>
    );
  }
  if (list.isError && list.items.length === 0) {
    return (
      <div className="p-4">
        <RetryAlert onRetry={() => void list.refetch()}>{errorText}</RetryAlert>
      </div>
    );
  }
  if (list.items.length === 0) {
    return <EmptyNote title={emptyTitle} body={emptyBody ?? ''} />;
  }
  return (
    <div>
      <RequestsList items={list.items} showUser={!userId} label={label} />
      {list.isError ? (
        <div className="p-4">
          <RetryAlert onRetry={() => void list.fetchNextPage()}>
            {t('admin.reports.requests.loadMoreError')}
          </RetryAlert>
        </div>
      ) : null}
      {list.hasNextPage ? (
        <div className="border-border-subtle flex justify-center border-t p-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={list.isFetchingNextPage}
            onClick={() => void list.fetchNextPage()}
          >
            {t('admin.reports.requests.loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
