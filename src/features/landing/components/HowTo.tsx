import { Mail } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import { Button } from '~/components/ui/button';
import { ActivatedArt, EmailArt, SignUpArt } from './art';
import { Container, SectionTitle } from './layout';

function Step({
  number,
  Art,
  children,
}: {
  number: number;
  Art: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <li className="bg-canvas border-border-subtle overflow-hidden rounded-lg border">
      <div className="bg-surface-muted border-border-subtle flex h-[120px] items-center justify-center border-b">
        <Art className="h-[92px] w-[132px]" />
      </div>
      <div className="p-5">
        <p className="text-fg-muted text-[13px]">
          {t('landing.howTo.step', { number })}
        </p>
        <p className="text-fg text-[17px] font-semibold">{children}</p>
      </div>
    </li>
  );
}

export function HowTo() {
  const { t } = useTranslation();
  const { email } = brand.contact;
  return (
    <section
      id="how-to-get-a-plan"
      aria-labelledby="landing-how-to"
      className="bg-surface border-border-subtle scroll-mt-16 border-y"
    >
      <Container className="py-12 md:py-16">
        <SectionTitle id="landing-how-to">
          {t('landing.howTo.title')}
        </SectionTitle>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          <Step number={1} Art={SignUpArt}>
            {t('landing.howTo.step1')}
          </Step>
          <Step number={2} Art={EmailArt}>
            {email ? (
              <>
                {t('landing.howTo.step2')} <bdi dir="ltr">{email}</bdi>
              </>
            ) : (
              t('landing.howTo.step2Generic')
            )}
          </Step>
          <Step number={3} Art={ActivatedArt}>
            {t('landing.howTo.step3')}
          </Step>
        </ol>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <p className="text-fg-muted text-base">{t('landing.howTo.note')}</p>
          {email ? (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="gap-2 sm:ms-auto"
            >
              <a href={`mailto:${email}`}>
                <Mail aria-hidden="true" className="size-4" />
                {t('landing.howTo.contact')}
              </a>
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
