import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

/** Unknown route (also what non-admins see for /admin). */
export function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="bg-canvas flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-fg text-2xl font-bold">{t('common.notFound')}</h1>
      <Link
        to="/"
        className="text-brand font-semibold underline underline-offset-4"
      >
        {t('common.backHome')}
      </Link>
    </main>
  );
}
