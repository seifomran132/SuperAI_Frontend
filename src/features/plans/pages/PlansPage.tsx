import { Suspense, lazy } from 'react';
import { PageScroll } from '~/components/PageScroll';

import { PlansContent } from '../components/PlansContent';
import { PublicHeader } from '../components/PublicHeader';
import { useSignedIn } from '../model/useSignedIn';

// Lazy: signed-out visitors never download the chat shell.
const AppShell = lazy(() =>
  import('~/features/chat/ui').then((m) => ({ default: m.AppShell })),
);

/**
 * Public page. Signed in: inside the app shell (sidebar + header). Otherwise
 * (and while the session is still being read, e.g. in the prerendered HTML):
 * a public header with sign-in and sign-up links.
 */
export function PlansPage() {
  const signedIn = useSignedIn();
  if (signedIn) {
    return (
      <Suspense>
        <AppShell>
          <PageScroll>
            <PlansContent signedIn />
          </PageScroll>
        </AppShell>
      </Suspense>
    );
  }
  return (
    <div className="bg-canvas min-h-dvh">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <PlansContent signedIn={false} />
      </main>
    </div>
  );
}
