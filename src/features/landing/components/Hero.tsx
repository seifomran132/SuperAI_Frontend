import { Link } from '@tanstack/react-router';
import { ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { HeroArt } from './art';
import { Container, useTagline } from './layout';

function ChatPreview() {
  const { t } = useTranslation();
  return (
    // left/top follow fixed SVG coordinates: the art does not mirror.
    <div
      role="img"
      aria-label={t('landing.hero.previewLabel')}
      className="absolute flex flex-col justify-between gap-2 overflow-hidden py-2 ps-[6%] pe-[9%] sm:py-4"
      style={{ left: '14%', top: '12.8%', width: '72%', height: '63.6%' }}
    >
      <div className="flex justify-start">
        <div className="bg-surface-muted rounded-lg px-3 py-1.5 text-sm leading-[22px]">
          {t('landing.hero.previewQuestion')}
        </div>
      </div>
      <div className="bg-surface border-border-subtle rounded-lg border px-3 py-2 text-sm leading-[22px]">
        <p className="text-[15px] font-semibold">
          {t('landing.hero.previewTitle')}
        </p>
        <ol className="list-decimal ps-5">
          <li>{t('landing.hero.previewItem1')}</li>
          <li className="hidden sm:list-item">
            {t('landing.hero.previewItem2')}
          </li>
          <li className="hidden sm:list-item">
            {t('landing.hero.previewItem3')}
          </li>
        </ol>
      </div>
      <div className="bg-surface border-border-control flex items-center justify-between gap-2 rounded-lg border p-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="bg-mode-1-container border-mode-1-border text-mode-1 inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 text-[13px] font-medium">
            <Zap aria-hidden="true" className="size-4" />
            {t('landing.modes.fast')}
          </span>
          <span className="text-fg-muted hidden text-sm sm:inline">
            {t('landing.hero.previewPlaceholder')}
          </span>
        </div>
        <span className="bg-brand text-on-brand flex size-8 shrink-0 items-center justify-center rounded-full">
          <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
        </span>
      </div>
    </div>
  );
}

const glyph = (left: string, top: string) => ({
  left,
  top,
  transform: 'translate(-50%, -50%)',
});

export function Hero() {
  const { t } = useTranslation();
  const tagline = useTagline();
  return (
    <section className="overflow-hidden">
      <Container className="grid items-center gap-6 pt-10 pb-12 lg:grid-cols-[minmax(0,1fr)_560px] lg:gap-12 lg:pt-16 lg:pb-20">
        <div>
          <h1 className="text-fg text-[2rem] leading-[3.25rem] font-bold md:text-[2.75rem] md:leading-[4.5rem]">
            {tagline}
          </h1>
          <p className="text-fg-muted mt-4 max-w-[520px] text-[17px]">
            {t('landing.hero.body')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild>
              <Link to="/sign-up">{t('auth.signUp.title')}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/sign-in">{t('auth.signIn.title')}</Link>
            </Button>
          </div>
        </div>
        <div
          className="relative -mx-3 sm:mx-auto sm:w-full sm:max-w-[560px]"
          style={{ aspectRatio: '600 / 500' }}
        >
          <HeroArt className="absolute inset-0 size-full overflow-visible" />
          <span
            aria-hidden="true"
            className="text-on-brand absolute text-[22px] leading-none font-bold"
            style={glyph('84.5%', '8%')}
          >
            ع
          </span>
          <span
            aria-hidden="true"
            className="text-mode-1 absolute text-xl leading-none font-bold"
            style={glyph('93.5%', '13.5%')}
          >
            A
          </span>
          <ChatPreview />
        </div>
      </Container>
    </section>
  );
}
