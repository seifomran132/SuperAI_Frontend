import type { LucideIcon } from 'lucide-react';
import { Palette, Sparkles, Zap } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BalanceArt, FastArt, ImageArt, ProArt } from './art';
import { Container, SectionTitle } from './layout';

// Full class names so Tailwind finds them. Colors follow position, as in the app.
const tones = {
  1: {
    scene: 'bg-mode-1-container border-mode-1-border',
    chip: 'bg-mode-1-container border-mode-1-border text-mode-1',
  },
  2: {
    scene: 'bg-mode-2-container border-mode-2-border',
    chip: 'bg-mode-2-container border-mode-2-border text-mode-2',
  },
  3: {
    scene: 'bg-mode-3-container border-mode-3-border',
    chip: 'bg-mode-3-container border-mode-3-border text-mode-3',
  },
};

function ModeCard({
  position,
  Art,
  Icon,
  label,
  title,
  body,
  badge,
}: {
  position: 1 | 2 | 3;
  Art: ComponentType<{ className?: string }>;
  Icon: LucideIcon;
  label: string;
  title: string;
  body: string;
  badge?: ReactNode;
}) {
  const tone = tones[position];
  return (
    <article className="bg-canvas border-border-subtle overflow-hidden rounded-lg border">
      <div
        className={`flex h-[140px] items-center justify-center border-b ${tone.scene}`}
      >
        <Art className="h-[110px] w-[200px]" />
      </div>
      <div className="p-6">
        <span className="inline-flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold ${tone.chip}`}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </span>
          {badge}
        </span>
        <p className="text-fg mt-4 text-lg leading-[30px] font-semibold">
          {title}
        </p>
        <p className="text-fg-muted mt-2 text-base">{body}</p>
      </div>
    </article>
  );
}

export function Modes() {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="landing-modes"
      className="bg-surface border-border-subtle border-y"
    >
      <Container className="py-12 md:py-16">
        <SectionTitle id="landing-modes">
          {t('landing.modes.title')}
        </SectionTitle>
        <p className="text-fg-muted mt-2 max-w-[640px] text-[17px]">
          {t('landing.modes.intro')}
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <ModeCard
            position={1}
            Art={FastArt}
            Icon={Zap}
            label={t('landing.modes.fast')}
            title={t('landing.modes.fastTitle')}
            body={t('landing.modes.fastBody')}
          />
          <ModeCard
            position={2}
            Art={ProArt}
            Icon={Sparkles}
            label={t('landing.modes.pro')}
            title={t('landing.modes.proTitle')}
            body={t('landing.modes.proBody')}
          />
          <ModeCard
            position={3}
            Art={ImageArt}
            Icon={Palette}
            label={t('landing.modes.image')}
            title={t('landing.modes.imageTitle')}
            body={t('landing.modes.imageBody')}
            badge={
              <span className="bg-brand text-on-brand inline-flex min-h-7 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium">
                <Palette aria-hidden="true" className="size-4" />
                {t('landing.modes.imageBadge')}
              </span>
            }
          />
        </div>
      </Container>
    </section>
  );
}

const nodeLabel = 'absolute -translate-1/2 text-sm font-semibold sm:text-base';

export function Balance() {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="landing-balance"
      className="bg-brand text-on-brand"
    >
      <Container className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h2
            id="landing-balance"
            className="text-2xl leading-10 font-bold md:text-[30px] md:leading-12"
          >
            {t('landing.balance.title')}
          </h2>
          <p className="text-border-subtle mt-3 max-w-[480px] text-[17px]">
            {t('landing.balance.body')}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative mx-auto w-full max-w-[480px] md:ms-auto"
          style={{ aspectRatio: '480 / 320' }}
        >
          <BalanceArt className="absolute inset-0 size-full" />
          <span
            className={`${nodeLabel} text-mode-3`}
            style={{ left: '16.7%', top: '29%' }}
          >
            {t('landing.modes.image')}
          </span>
          <span
            className={`${nodeLabel} text-mode-2`}
            style={{ left: '50%', top: '29%' }}
          >
            {t('landing.modes.pro')}
          </span>
          <span
            className={`${nodeLabel} text-mode-1`}
            style={{ left: '83.3%', top: '29%' }}
          >
            {t('landing.modes.fast')}
          </span>
          <span
            className="absolute inline-flex -translate-1/2 items-center gap-1.5 text-sm font-medium whitespace-nowrap sm:text-base"
            style={{ left: '50%', top: '91%' }}
          >
            <span className="text-fg-muted">{t('landing.balance.label')}</span>
            <bdi dir="ltr" className="text-fg font-bold">
              14.50$
            </bdi>
          </span>
        </div>
      </Container>
    </section>
  );
}
