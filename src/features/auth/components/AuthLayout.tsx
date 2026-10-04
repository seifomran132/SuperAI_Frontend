import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';

interface AuthLayoutProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}

/** Centered single-card layout for every pre-login screen: no sidebar. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { i18n } = useTranslation();
  const name = i18n.language === 'en' ? brand.name.en : brand.name.ar;
  return (
    <main className="bg-canvas flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-2">
        <span
          aria-hidden="true"
          className="bg-brand text-on-brand flex size-10 items-center justify-center rounded-md text-xl font-bold"
        >
          {brand.monogram}
        </span>
        <span className="text-fg text-xl font-bold">{name}</span>
      </div>
      <div className="bg-surface border-border-subtle w-full max-w-[440px] rounded-lg border p-6 sm:p-9">
        {title || subtitle ? (
          <header className="mb-6 grid gap-2">
            {title ? (
              <h1 className="text-fg text-2xl leading-9 font-bold">{title}</h1>
            ) : null}
            {subtitle ? (
              <p className="text-fg-muted text-base leading-7">{subtitle}</p>
            ) : null}
          </header>
        ) : null}
        {children}
      </div>
    </main>
  );
}
