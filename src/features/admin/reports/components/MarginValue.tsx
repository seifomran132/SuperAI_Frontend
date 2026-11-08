import type { UsageTotalsDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { marginPercent, toDecimal } from '~/lib/money';
import { cn } from '~/lib/utils';

/** Margin with its sign, danger colour only when negative, and its % of what was charged. */
export function MarginValue({
  stats,
  showPercent = false,
}: {
  stats: Pick<UsageTotalsDto, 'marginUsd' | 'chargedUsd'>;
  showPercent?: boolean;
}) {
  const percent = showPercent
    ? marginPercent(stats.marginUsd, stats.chargedUsd)
    : null;
  return (
    <span
      className={cn(toDecimal(stats.marginUsd).isNegative() && 'text-danger')}
    >
      <Money value={stats.marginUsd} signed />
      {percent !== null ? (
        <>
          {' '}
          <bdi dir="ltr" className="text-sm font-normal">
            ({percent.replace('-', '−')}%)
          </bdi>
        </>
      ) : null}
    </span>
  );
}
