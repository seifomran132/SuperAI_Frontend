import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { AppErrorScreen } from '~/components/AppErrorScreen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  chunkReloadAlreadyTried,
  isChunkLoadError,
  reloadOnceForChunkError,
} from '~/lib/chunk-error';
import { isNetworkError } from '~/lib/network-error';

/**
 * Router and root error screen. API and network failures stay a recoverable
 * alert; a stale chunk reloads once, then asks the user to; anything else is a
 * full-page screen (no message or stack is ever shown).
 */
export function RouteError({ error }: { error: unknown }) {
  const chunk = isChunkLoadError(error);
  const reloading = chunk && !chunkReloadAlreadyTried();

  useEffect(() => {
    if (reloading) reloadOnceForChunkError();
  }, [reloading]);

  useEffect(() => {
    if (import.meta.env.DEV) console.error(error);
  }, [error]);

  if (chunk) return reloading ? null : <AppErrorScreen variant="newVersion" />;
  if (isApiError(error) || isNetworkError(error)) {
    return <RecoverableError error={error} />;
  }
  return <AppErrorScreen variant="unexpected" />;
}

function RecoverableError({ error }: { error: unknown }) {
  const { t } = useTranslation();
  const router = useRouter();
  const key = isApiError(error)
    ? errorMessageKey(error)
    : 'common.networkError';
  return (
    <main className="bg-canvas flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        <Alert
          variant="danger"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void router.invalidate()}
            >
              {t('common.retry')}
            </Button>
          }
        >
          {t(key)}
        </Alert>
      </div>
    </main>
  );
}
