import { useTranslation } from 'react-i18next';
import type { MyDesignUsageDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { formatCount } from '~/lib/numbers';

/** «التصاميم» (S28): design runs by agent, apart from the message totals. */
export function ByDesigns({ rows }: { rows: MyDesignUsageDto[] }) {
  const { t, i18n } = useTranslation();
  const en = i18n.language === 'en';
  const cell = 'px-4 py-3 text-start font-medium';
  return (
    <section aria-labelledby="usage-designs" className="grid gap-3">
      <h2 id="usage-designs" className="text-fg text-lg font-medium">
        {t('usage.designs.title')}
      </h2>
      <div className="border-border-subtle bg-surface overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-start text-sm">
          <caption className="sr-only">{t('usage.designs.title')}</caption>
          <thead>
            <tr className="text-fg-muted border-border-subtle border-b">
              <th scope="col" className={cell}>
                {t('usage.designs.agent')}
              </th>
              <th scope="col" className={cell}>
                {t('usage.designs.runs')}
              </th>
              <th scope="col" className={cell}>
                {t('usage.designs.designs')}
              </th>
              <th scope="col" className={cell}>
                {t('usage.byMode.amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.agentKey}
                className="border-border-subtle border-b last:border-b-0"
              >
                <th
                  scope="row"
                  className="text-fg px-4 py-3 text-start font-normal"
                >
                  {(en ? row.labelEn : row.labelAr) ?? row.agentKey}
                </th>
                <td className="text-fg-muted px-4 py-3 tabular-nums">
                  <bdi dir="ltr">{formatCount(row.runs)}</bdi>
                </td>
                <td className="text-fg-muted px-4 py-3 tabular-nums">
                  <bdi dir="ltr">{formatCount(row.designs)}</bdi>
                </td>
                <td className="text-fg px-4 py-3 font-medium whitespace-nowrap">
                  <Money value={row.chargedUsd} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-fg-subtle text-sm">{t('usage.designs.note')}</p>
    </section>
  );
}
