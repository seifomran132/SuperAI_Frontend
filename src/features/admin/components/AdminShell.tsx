import { useEffect, useState } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Menu, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { meControllerGetOptions } from '~/api/generated/@tanstack/react-query.gen';
import { Button } from '~/components/ui/button';
import { AdminSidebar } from './AdminSidebar';

/** Title key (admin.titles.*) for an admin path. */
function titleKey(pathname: string): string {
  const [, , area, rest] = pathname.split('/');
  if (area === 'plans' || area === 'models' || area === 'modes') {
    const one =
      area === 'plans' ? 'plan' : area === 'models' ? 'model' : 'mode';
    return !rest ? area : rest === 'new' ? `${one}New` : `${one}Detail`;
  }
  if (area === 'providers' || area === 'settings') return area;
  return area === 'users' && rest ? 'userDetail' : 'users';
}

/**
 * Admin frame: its own sidebar (first in the DOM, so on the right in RTL) from
 * 1024px, a right-side drawer below that, and a header with the page title and
 * the signed-in admin.
 */
export function AdminShell() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: me } = useQuery(meControllerGetOptions());

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const title = t(`admin.titles.${titleKey(pathname)}`);

  return (
    <div className="bg-canvas flex h-dvh overflow-hidden">
      <aside
        aria-label={t('admin.nav.panel')}
        className="bg-surface border-border-subtle hidden w-70 shrink-0 border-e lg:block"
      >
        <AdminSidebar />
      </aside>

      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-40 lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="bg-surface fixed inset-y-0 start-0 z-50 flex w-[min(320px,85vw)] flex-col shadow-lg outline-hidden lg:hidden"
          >
            <Dialog.Title className="sr-only">
              {t('admin.nav.panel')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('admin.nav.closeMenu')}
                className="absolute end-2 top-2.5 z-10"
              >
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
            <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-surface border-border-subtle flex h-16 shrink-0 items-center gap-3 border-b px-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t('admin.nav.openMenu')}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>
          <h1 className="text-fg min-w-0 flex-1 truncate text-2xl font-bold">
            {title}
          </h1>
          {me?.email ? (
            <bdi
              dir="ltr"
              className="text-fg-muted hidden truncate text-sm sm:block"
            >
              {me.email}
            </bdi>
          ) : null}
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
