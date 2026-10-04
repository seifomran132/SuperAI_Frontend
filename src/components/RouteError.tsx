import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';

/** Default recoverable error for a route whose loader/guard failed. */
export function RouteError({ error }: { error: unknown }) {
  const { t } = useTranslation();
  const router = useRouter();
  // Non-API failures here are almost always the network.
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
