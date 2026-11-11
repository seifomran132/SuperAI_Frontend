import { brand } from '~/brand';
import { cn } from '~/lib/utils';

/**
 * The brand's symbol: its glyph on the brand tile (logo A for لمحة AI), or
 * the monogram for a brand without one. Size it with `className` (e.g.
 * `size-10`); `textClassName` sizes the monogram fallback. Decorative: the
 * brand name always sits next to it.
 */
export function BrandSymbol({
  className,
  textClassName = 'text-base',
}: {
  className?: string;
  textClassName?: string;
}) {
  const mark = brand.mark;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-brand text-on-brand flex shrink-0 items-center justify-center font-bold',
        // The logo's corner is 14 of 64 units; the monogram keeps the card radius.
        mark ? 'rounded-[22%]' : 'rounded-md',
        mark ? null : textClassName,
        className,
      )}
    >
      {mark ? (
        <svg viewBox="0 0 64 64" className="size-full" focusable="false">
          <path
            d={mark.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={mark.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {mark.dot ? (
            <circle
              cx={mark.dot.cx}
              cy={mark.dot.cy}
              r={mark.dot.r}
              className="fill-brand-accent"
            />
          ) : null}
        </svg>
      ) : (
        brand.monogram
      )}
    </span>
  );
}
