import { Link } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container, SectionTitle } from './layout';

const questions = [1, 2, 3, 4, 5];

export function Faq() {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="landing-faq"
      className="mx-auto w-full max-w-[800px] px-4 py-12 md:px-6 md:py-16"
    >
      <SectionTitle id="landing-faq">{t('landing.faq.title')}</SectionTitle>
      <div className="bg-surface border-border-subtle divide-border-subtle mt-6 divide-y rounded-lg border">
        {questions.map((n) => (
          <details key={n} open={n === 1} className="group">
            <summary className="text-fg flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
              {t(`landing.faq.q${n}`)}
              <ChevronDown
                aria-hidden="true"
                className="text-fg-muted size-5 shrink-0 group-open:rotate-180"
              />
            </summary>
            <p className="text-fg-muted px-5 pb-4 text-base">
              {t(`landing.faq.a${n}`)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Closing() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="landing-closing">
      <Container className="pb-14 md:pb-20">
        <div className="bg-brand text-on-brand flex flex-col gap-8 rounded-xl px-6 py-12 md:flex-row md:items-center md:justify-between md:px-14 md:py-14">
          <div>
            <h2
              id="landing-closing"
              className="text-[26px] leading-11 font-bold md:text-[32px] md:leading-[3.25rem]"
            >
              {t('landing.closing.title')}
            </h2>
            <p className="text-border-subtle mt-2 text-[17px]">
              {t('landing.closing.body')}
            </p>
          </div>
          <div className="flex flex-col gap-3 whitespace-nowrap sm:flex-row sm:items-center">
            <Link
              to="/sign-up"
              className="bg-on-brand text-brand hover:bg-surface-muted inline-flex min-h-12 items-center justify-center rounded-md px-7 text-base font-semibold"
            >
              {t('auth.signUp.title')}
            </Link>
            <Link
              to="/sign-in"
              className="text-on-brand inline-flex min-h-12 items-center justify-center px-5 text-base font-semibold underline underline-offset-4"
            >
              {t('auth.signIn.title')}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
