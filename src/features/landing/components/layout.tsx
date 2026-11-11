import { Link } from '@tanstack/react-router';
import { Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import { Button } from '~/components/ui/button';
import { BrandSymbol } from '~/components/BrandSymbol';
import { cn } from '~/lib/utils';

export function useBrandName() {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? brand.name.en : brand.name.ar;
}

export function useTagline() {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? brand.tagline.en : brand.tagline.ar;
}

/** Page width and side gutters shared by every section. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1120px] px-4 md:px-6', className)}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-fg text-2xl leading-10 font-bold md:text-[28px]"
    >
      {children}
    </h2>
  );
}

function Mark() {
  const name = useBrandName();
  return (
    <>
      <BrandSymbol className="size-10" textClassName="text-xl" />
      <span className="text-fg text-lg font-semibold whitespace-nowrap">
        {name}
      </span>
    </>
  );
}

export function LandingHeader() {
  const { t } = useTranslation();
  return (
    <header className="bg-surface border-border-subtle sticky top-0 z-20 border-b">
      <Container className="flex h-16 items-center justify-between gap-2">
        <Link to="/" className="flex min-h-11 items-center gap-2.5">
          <Mark />
        </Link>
        <nav className="flex items-center gap-1 md:gap-3">
          <Button asChild variant="ghost" size="sm" className="px-3">
            <Link to="/sign-in">{t('auth.signIn.title')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/sign-up">{t('auth.signUp.title')}</Link>
          </Button>
        </nav>
      </Container>
    </header>
  );
}

export function LandingFooter() {
  const { t } = useTranslation();
  const tagline = useTagline();
  const { email } = brand.contact;
  const { termsUrl, privacyUrl } = brand.legal;
  const link = 'inline-flex min-h-11 items-center font-medium';
  const legalLink = cn(link, 'underline underline-offset-4');
  return (
    <footer className="bg-surface-muted border-border-subtle border-t">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark />
          </div>
          <p className="text-fg-muted mt-3 text-[15px]">{tagline}</p>
        </div>
        <ul className="text-fg flex flex-col items-start text-[15px]">
          {email ? (
            <li>
              <a href={`mailto:${email}`} className={cn(link, 'gap-2')}>
                <Mail aria-hidden="true" className="size-4" />
                <bdi dir="ltr">{email}</bdi>
              </a>
            </li>
          ) : null}
          {/* Shown once the brand has published legal pages. */}
          {termsUrl ? (
            <li>
              <a href={termsUrl} className={legalLink}>
                {t('landing.footer.terms')}
              </a>
            </li>
          ) : null}
          {privacyUrl ? (
            <li>
              <a href={privacyUrl} className={legalLink}>
                {t('landing.footer.privacy')}
              </a>
            </li>
          ) : null}
        </ul>
      </Container>
      <div className="border-border-subtle border-t">
        <Container className="py-4">
          <p className="text-fg-muted text-sm">{t('landing.footer.rights')}</p>
        </Container>
      </div>
    </footer>
  );
}
