import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import { Button } from '~/components/ui/button';

/** Signed-out header: brand on the start side, sign-in and sign-up on the end. */
export function PublicHeader() {
  const { t, i18n } = useTranslation();
  const name = i18n.language === 'en' ? brand.name.en : brand.name.ar;
  return (
    <header className="bg-surface border-border-subtle flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-brand text-on-brand flex size-9 items-center justify-center rounded-md text-lg font-bold"
        >
          {brand.monogram}
        </span>
        <span className="text-fg text-lg font-bold">{name}</span>
      </div>
      <nav className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/sign-in">{t('auth.signIn.title')}</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/sign-up">{t('auth.signUp.title')}</Link>
        </Button>
      </nav>
    </header>
  );
}
