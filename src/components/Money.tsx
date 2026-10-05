import { useTranslation } from 'react-i18next';
import {
  formatUsd,
  toDecimal,
  type FormatUsdOptions,
  type MoneyString,
} from '~/lib/money';

/** "+" for credits, U+2212 "−" for charges, nothing for zero. */
function signOf(value: MoneyString): string {
  const amount = toDecimal(value);
  if (amount.isZero()) return '';
  return amount.isNegative() ? '−' : '+';
}

/** The only way to show money. <bdi> keeps "14.48$" intact inside right-to-left text. */
export function Money({
  value,
  kind,
  signed = false,
}: {
  value: MoneyString;
  /** `cost` for per-answer costs and estimates (more precision below 1 USD). */
  kind?: FormatUsdOptions['kind'];
  /** Activity rows: the sign sits inside the same <bdi> as the amount. */
  signed?: boolean;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  const text = formatUsd(
    signed ? toDecimal(value).abs().toFixed() : value,
    locale,
    { kind },
  );
  return (
    <bdi dir="ltr" className="tabular-nums">
      {signed ? signOf(value) : ''}
      {text}
    </bdi>
  );
}
