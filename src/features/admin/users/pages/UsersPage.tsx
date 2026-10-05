import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { UsersTable } from '../components/UsersTable';
import { useUsers } from '../model/queries';
import {
  USER_STATUSES,
  USERS_PAGE_SIZE,
  validateUsersSearch,
  type UserStatus,
  type UsersSearch,
} from '../model/search';

const DEBOUNCE_MS = 300;

function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'bg-surface text-fg border-border-control focus-visible:outline-focus h-12 min-w-40 rounded-md border px-3 text-base outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      {...props}
    />
  );
}

/** A1: search, status/role filters (all in the URL) and the paged users table. */
export function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: '/admin/users/' });
  const search = validateUsersSearch(useSearch({ strict: false }));
  const users = useUsers(search);

  const update = (patch: Partial<UsersSearch>) =>
    void navigate({
      to: '/admin/users',
      search: (prev) =>
        validateUsersSearch({ ...prev, page: undefined, ...patch }),
      replace: true,
    });

  // The box edits freely; the URL (and the request) follows after a pause.
  const [text, setText] = useState(search.q ?? '');
  useEffect(() => {
    const next = text.trim();
    if (next === (search.q ?? '')) return;
    const timer = setTimeout(
      () => update({ q: next === '' ? undefined : next }),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, search.q]);

  const page = search.page ?? 1;
  const data = users.data;
  const pages = data ? Math.max(1, Math.ceil(data.total / USERS_PAGE_SIZE)) : 1;

  // The clicked pager button disables itself on the first/last page: hand focus to the other one.
  const prevButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const clicked = useRef<'prev' | 'next' | null>(null);
  useEffect(() => {
    if (clicked.current === 'prev' && page <= 1) nextButton.current?.focus();
    if (clicked.current === 'next' && page >= pages)
      prevButton.current?.focus();
    clicked.current = null;
  }, [page, pages]);
  const role =
    search.isAdmin === undefined ? '' : search.isAdmin ? 'admin' : 'user';

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search
            aria-hidden="true"
            className="text-fg-subtle pointer-events-none absolute inset-y-0 end-4 my-auto size-5"
          />
          <Input
            type="search"
            aria-label={t('admin.users.searchLabel')}
            placeholder={t('admin.users.search')}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="pe-12"
          />
        </div>
        <Select
          aria-label={t('admin.users.statusFilter')}
          value={search.status ?? ''}
          onChange={(event) =>
            update({ status: (event.target.value || undefined) as UserStatus })
          }
        >
          <option value="">
            {t('admin.users.statusFilter')}: {t('admin.users.all')}
          </option>
          {USER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`admin.users.status.${status}`)}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t('admin.users.roleFilter')}
          value={role}
          onChange={(event) =>
            update({
              isAdmin:
                event.target.value === ''
                  ? undefined
                  : event.target.value === 'admin',
            })
          }
        >
          <option value="">
            {t('admin.users.roleFilter')}: {t('admin.users.all')}
          </option>
          <option value="admin">{t('admin.users.role.admin')}</option>
          <option value="user">{t('admin.users.role.user')}</option>
        </Select>
      </div>

      <section className="bg-surface border-border-subtle overflow-hidden rounded-lg border">
        {users.isPending ? (
          <p role="status" className="text-fg-muted p-8 text-center">
            {t('admin.common.loading')}
          </p>
        ) : users.isError && !data ? (
          <div className="p-4">
            <RetryAlert onRetry={() => void users.refetch()}>
              {t('admin.users.error')}
            </RetryAlert>
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-fg text-lg font-semibold">
              {t('admin.users.emptyTitle')}
            </p>
            <p className="text-fg-muted mt-1">{t('admin.users.emptyBody')}</p>
          </div>
        ) : data ? (
          <>
            {users.isError ? (
              <div className="p-4">
                <RetryAlert onRetry={() => void users.refetch()}>
                  {t('admin.users.error')}
                </RetryAlert>
              </div>
            ) : null}
            <UsersTable users={data.items} />
            <nav
              aria-label={t('admin.users.tableLabel')}
              className="border-border-subtle flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
            >
              <span className="text-fg-muted text-sm">
                <Trans
                  i18nKey="admin.users.range"
                  values={{
                    from: (data.page - 1) * data.pageSize + 1,
                    to: Math.min(data.page * data.pageSize, data.total),
                    total: data.total,
                  }}
                  components={{ n: <bdi dir="ltr" /> }}
                />
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label={t('admin.users.prev')}
                  ref={prevButton}
                  disabled={page <= 1}
                  onClick={() => {
                    clicked.current = 'prev';
                    void navigate({
                      to: '/admin/users',
                      search: (prev) =>
                        validateUsersSearch({ ...prev, page: page - 1 }),
                    });
                  }}
                >
                  <ChevronLeft
                    aria-hidden="true"
                    className="rtl:-scale-x-100"
                  />
                </Button>
                <span aria-live="polite" className="text-fg-muted text-sm">
                  {t('admin.users.pageOf', { page, pages })}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label={t('admin.users.next')}
                  ref={nextButton}
                  disabled={page >= pages}
                  onClick={() => {
                    clicked.current = 'next';
                    void navigate({
                      to: '/admin/users',
                      search: (prev) =>
                        validateUsersSearch({ ...prev, page: page + 1 }),
                    });
                  }}
                >
                  <ChevronRight
                    aria-hidden="true"
                    className="rtl:-scale-x-100"
                  />
                </Button>
              </div>
            </nav>
          </>
        ) : null}
      </section>
    </>
  );
}
