import { useTranslation } from 'react-i18next';
import { formatUsd, type MoneyString } from '~/lib/money';

/** The only way to show money. <bdi> keeps "14.48$" intact inside right-to-left text. */
export function Money({ value }: { value: MoneyString }) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  return (
    <bdi dir="ltr" className="tabular-nums">
      {formatUsd(value, locale)}
    </bdi>
  );
}
