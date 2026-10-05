import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { useChatStore } from '../model/chat-store';
import { ChatHeader } from './ChatHeader';
import { Sidebar } from './Sidebar';

/**
 * Sidebar + header + page. The sidebar is first in the DOM, so in the
 * right-to-left row it sits on the right: fixed at 280px from 1024px up, a
 * right-side drawer below that.
 */
export function AppShell({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  const drawerOpen = useChatStore((s) => s.drawerOpen);
  const setDrawerOpen = useChatStore((s) => s.setDrawerOpen);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // A route change (a conversation was picked, a link followed) closes the drawer.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, setDrawerOpen]);

  // Growing past the drawer breakpoint turns the drawer into the fixed sidebar.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [setDrawerOpen]);

  return (
    <div className="bg-canvas flex h-dvh overflow-hidden">
      <aside
        aria-label={t('shell.sidebarTitle')}
        className="bg-surface border-border-subtle hidden w-70 shrink-0 border-e lg:block"
      >
        <Sidebar />
      </aside>

      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-40 lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              // Opened from state, not a Trigger: hand focus back to the menu button.
              const opener = document.querySelector<HTMLElement>(
                '[data-drawer-opener]',
              );
              if (opener) {
                event.preventDefault();
                opener.focus();
              }
            }}
            className="bg-surface fixed inset-y-0 start-0 z-50 flex w-[min(320px,85vw)] flex-col shadow-lg outline-hidden lg:hidden"
          >
            <Dialog.Title className="sr-only">
              {t('shell.sidebarTitle')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('shell.closeMenu')}
                className="absolute end-2 top-2.5 z-10"
              >
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
            <Sidebar withSignOut onNavigate={() => setDrawerOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader />
        <main className="min-h-0 flex-1">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
