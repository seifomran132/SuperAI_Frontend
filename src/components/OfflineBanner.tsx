import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { useOnline } from '~/lib/useOnline';

/** Shown at the top of the shells while the browser is offline. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const online = useOnline();
  if (online) return null;
  return (
    <div className="px-3 pt-3 sm:px-6">
      <Alert variant="info" role="status">
        {t('common.offline')}
      </Alert>
    </div>
  );
}
