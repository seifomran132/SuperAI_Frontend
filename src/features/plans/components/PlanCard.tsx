import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import type { PublicPlanDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Button } from '~/components/ui/button';
import {
  ModeIcon,
  modeTone,
  useModeDescription,
  useModeLabel,
} from '~/features/chat/mode-ui';
import { toDecimal } from '~/lib/money';
import { cn } from '~/lib/utils';

/**
 * One plan. The included balance line is hidden when it is 0. No checkout:
 * the button only opens the contact dialog.
 */
export function PlanCard({
  plan,
  current,
  onSubscribe,
}: {
  plan: PublicPlanDto;
  current: boolean;
  onSubscribe: () => void;
}) {
  const { t, i18n } = useTranslation();
  const modeLabel = useModeLabel();
  const modeDescription = useModeDescription();
  const en = i18n.language === 'en';
  const name = en ? plan.nameEn : plan.nameAr;
  const free = toDecimal(plan.monthlyPriceUsd).isZero();
  const hasBalance = !toDecimal(plan.includedBalanceUsd).isZero();

  return (
    <li
      data-current={current || undefined}
      className={cn(
        'bg-surface flex flex-col gap-5 rounded-lg p-6',
        current ? 'border-brand border-2' : 'border-border-subtle border',
      )}
    >
      <article aria-labelledby={`plan-${plan.key}`} className="contents">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-3">
            <h2 id={`plan-${plan.key}`} className="text-fg text-xl font-bold">
              {name}
            </h2>
            {current ? (
              <span className="bg-brand text-on-brand inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold">
                <Check aria-hidden="true" className="size-4" />
                {t('plans.current')}
              </span>
            ) : null}
          </div>
          <p className="text-fg-muted text-base">
            {en ? plan.descriptionEn : plan.descriptionAr}
          </p>
        </div>
        <p className="text-fg flex items-baseline gap-2 text-3xl font-bold">
          {free ? (
            t('plans.free')
          ) : (
            <>
              <Money value={plan.monthlyPriceUsd} />
              <span className="text-fg-muted text-base font-normal">
                {t('plans.perMonth')}
              </span>
            </>
          )}
        </p>
        {hasBalance ? (
          <p className="text-fg-muted text-base">
            {t('plans.currentBalance')}{' '}
            <span className="text-fg font-semibold">
              <Money value={plan.includedBalanceUsd} />
            </span>
          </p>
        ) : null}
        <ul className="grid gap-3">
          {plan.modes.map((mode, index) => (
            <li key={mode.key} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border',
                  modeTone(index + 1).chip,
                )}
              >
                <ModeIcon position={index + 1} />
              </span>
              <div className="grid gap-0.5">
                <span className="text-fg text-base font-semibold">
                  {modeLabel(mode)}
                </span>
                <span className="text-fg-muted text-sm">
                  {modeDescription(mode)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-fg-muted text-sm">{t('plans.duration')}</p>
        <Button
          type="button"
          variant={current ? 'secondary' : 'primary'}
          onClick={onSubscribe}
          className="mt-auto w-full"
        >
          {t('plans.subscribe')}
        </Button>
      </article>
    </li>
  );
}
