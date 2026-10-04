import { useTranslation } from 'react-i18next';
import {
  formatUsd,
  type FormatUsdOptions,
  type MoneyString,
} from '~/lib/money';

/** The only way to show money. <bdi> keeps "14.48$" intact inside right-to-left text. */
export function Money({
  value,
  kind,
}: {
  value: MoneyString;
  /** `cost` for per-answer costs and estimates (more precision below 1 USD). */
  kind?: FormatUsdOptions['kind'];
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  return (
    <bdi dir="ltr" className="tabular-nums">
      {formatUsd(value, locale, { kind })}
    </bdi>
  );
}
