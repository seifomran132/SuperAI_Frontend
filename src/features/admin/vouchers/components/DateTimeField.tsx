import { useTranslation } from 'react-i18next';
import { TextField } from '../../components/FormControls';
import { maskDateTime } from '../model/dates';

/**
 * A masked text field, not `datetime-local`: the native control follows the browser's
 * language and shows Arabic-Indic digits in an Arabic Chrome.
 */
export function DateTimeField({
  label,
  hint,
  value,
  error,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <TextField
      label={label}
      hint={hint}
      dir="ltr"
      inputMode="numeric"
      autoComplete="off"
      maxLength={16}
      placeholder={t('admin.vouchers.dateTimePlaceholder')}
      value={value}
      error={error}
      onChange={(x) => onChange(maskDateTime(x))}
    />
  );
}
