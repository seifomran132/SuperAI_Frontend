import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { Button, buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { selectClass } from '../../components/FormControls';
import { VouchersTable } from '../components/VouchersTable';
import { useVouchers } from '../model/queries';
import { validateVouchersSearch } from '../model/search';

/** S22 list: «مفعّل / موقوف» filter in the URL, cursor paging. */
export function VouchersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: '/admin/vouchers/' });
  const { status } = validateVouchersSearch(useSearch({ strict: false }));
  const list = useVouchers(status);
  const setStatus = (value: string) =>
    void navigate({
      to: '/admin/vouchers',
      search: validateVouchersSearch({ status: value || undefined }),
      replace: true,
    });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          aria-label={t('admin.vouchers.filter.label')}
          value={status ?? ''}
          onChange={(event) => setStatus(event.target.value)}
          className={cn(selectClass, 'w-auto min-w-40')}
        >
          <option value="">
            {t('admin.vouchers.filter.label')}: {t('admin.vouchers.filter.all')}
          </option>
          <option value="active">{t('admin.vouchers.filter.active')}</option>
          <option value="inactive">
            {t('admin.vouchers.filter.inactive')}
          </option>
        </select>
        <Link
          to="/admin/vouchers/new"
          className={cn(buttonVariants({ variant: 'primary' }))}
        >
          <Plus aria-hidden="true" className="size-5" />
          {t('admin.vouchers.new')}
        </Link>
      </div>

      <section className="bg-surface border-border-subtle overflow-hidden rounded-lg border">
        {list.isPending ? (
          <p role="status" className="text-fg-muted p-10 text-center">
            {t('admin.common.loading')}
          </p>
        ) : !list.data ? (
          <div className="p-4">
            <RetryAlert onRetry={() => void list.refetch()}>
              {t('admin.vouchers.error')}
            </RetryAlert>
          </div>
        ) : list.items.length === 0 ? (
          <div className="grid justify-items-center gap-3 p-10 text-center">
            <p className="text-fg text-lg font-semibold">
              {status
                ? t(`admin.vouchers.emptyFiltered.${status}`)
                : t('admin.vouchers.emptyTitle')}
            </p>
            <p className="text-fg-muted">
              {status
                ? t('admin.vouchers.emptyFilteredBody')
                : t('admin.vouchers.emptyBody')}
            </p>
            {status ? (
              <Button variant="secondary" onClick={() => setStatus('')}>
                {t('admin.vouchers.showAll')}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <VouchersTable vouchers={list.items} />
            {list.isError ? (
              <div className="p-4">
                <RetryAlert onRetry={() => void list.fetchNextPage()}>
                  {t('admin.vouchers.loadMoreError')}
                </RetryAlert>
              </div>
            ) : null}
            {list.hasNextPage ? (
              <div className="border-border-subtle flex justify-center border-t p-4">
                <Button
                  variant="secondary"
                  loading={list.isFetchingNextPage}
                  onClick={() => void list.fetchNextPage()}
                >
                  {t('admin.vouchers.loadMore')}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
