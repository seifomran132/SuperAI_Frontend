import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';

/** Full-page screen for an unexpected crash or a stale deploy. Never shows error details. */
export function AppErrorScreen({
  variant,
}: {
  variant: 'unexpected' | 'newVersion';
}) {
  const { t } = useTranslation();
  const key = variant === 'newVersion' ? 'common.newVersion' : 'common.crash';
  return (
    <main className="bg-canvas flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-fg text-2xl font-bold">{t(`${key}.title`)}</h1>
      <p className="text-fg-muted max-w-[440px] text-base leading-7">
        {t(`${key}.body`)}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={() => globalThis.location.reload()}>
          {t('common.reload')}
        </Button>
        {variant === 'unexpected' ? (
          <Button asChild variant="secondary">
            <Link to="/chat">{t('common.goToChat')}</Link>
          </Button>
        ) : null}
      </div>
    </main>
  );
}
