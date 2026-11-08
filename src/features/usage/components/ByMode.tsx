import { useTranslation } from 'react-i18next';
import type { MyUsageByModeDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { useModes } from '~/features/chat';
import { sharePercent } from '~/lib/money';
import { formatCount } from '~/lib/numbers';

// Palette classes written out in full so Tailwind sees them. Colour is by position in
// GET /modes; a removed or unknown mode is neutral.
const TONES = ['bg-mode-1', 'bg-mode-2', 'bg-mode-3', 'bg-mode-4'] as const;
const NEUTRAL = 'bg-fg-subtle';

export function ByMode({
  rows,
  totalCharged,
}: {
  rows: MyUsageByModeDto[];
  totalCharged: string;
}) {
  const { t, i18n } = useTranslation();
  const { modes } = useModes();
  const en = i18n.language === 'en';

  return (
    <section aria-labelledby="usage-by-mode" className="grid gap-3">
      <h2 id="usage-by-mode" className="text-fg text-lg font-medium">
        {t('usage.byMode.title')}
      </h2>
      <div className="border-border-subtle bg-surface overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-start text-sm">
          <caption className="sr-only">{t('usage.byMode.title')}</caption>
          <thead>
            <tr className="text-fg-muted border-border-subtle border-b">
              <th scope="col" className="px-4 py-3 text-start font-medium">
                {t('usage.byMode.mode')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                <span className="sr-only">{t('usage.byMode.share')}</span>
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                {t('usage.messages')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                {t('usage.byMode.amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const label = en ? row.labelEn : row.labelAr;
              const position = modes.findIndex((m) => m.key === row.modeKey);
              const tone =
                label && position >= 0
                  ? TONES[position % TONES.length]!
                  : NEUTRAL;
              return (
                <tr
                  key={row.modeKey}
                  className="border-border-subtle border-b last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-start font-normal whitespace-nowrap"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={`size-2.5 shrink-0 rounded-full ${tone}`}
                      />
                      <span className={label ? 'text-fg' : 'text-fg-muted'}>
                        {label ?? t('usage.byMode.removed')}
                      </span>
                    </span>
                  </th>
                  <td className="w-full min-w-24 px-4 py-3" aria-hidden>
                    <div className="bg-surface-muted h-2 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${tone}`}
                        style={{
                          width: `${sharePercent(row.chargedUsd, totalCharged)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="text-fg-muted px-4 py-3 tabular-nums">
                    <bdi dir="ltr">{formatCount(row.messages)}</bdi>
                  </td>
                  <td className="text-fg px-4 py-3 font-medium whitespace-nowrap">
                    <Money value={row.chargedUsd} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
