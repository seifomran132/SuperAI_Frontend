import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { CheckField } from '../../components/FormControls';
import { useModes } from '../model/queries';

/** Multi-select of the modes a plan includes (labels, never model names). */
export function ModeChecklist({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const { t, i18n } = useTranslation();
  const modes = useModes();
  return (
    <fieldset className="grid gap-1">
      <legend className="text-fg mb-1 text-sm font-medium">
        {t('admin.plans.modes')}
      </legend>
      {modes.isPending ? (
        <p role="status" className="text-fg-muted text-sm">
          {t('admin.common.loading')}
        </p>
      ) : modes.isError ? (
        <Alert variant="danger">{t('admin.modes.error')}</Alert>
      ) : modes.data.length === 0 ? (
        <p className="text-fg-muted text-sm">{t('admin.plans.noModes')}</p>
      ) : (
        modes.data.map((mode) => (
          <CheckField
            key={mode.key}
            label={i18n.language === 'en' ? mode.labelEn : mode.labelAr}
            checked={selected.includes(mode.key)}
            onChange={(on) =>
              onChange(
                on
                  ? [...selected, mode.key]
                  : selected.filter((k) => k !== mode.key),
              )
            }
          />
        ))
      )}
    </fieldset>
  );
}
