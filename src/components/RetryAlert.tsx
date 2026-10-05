import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';

/** Recoverable load error: message plus «إعادة المحاولة». */
export function RetryAlert({
  children,
  onRetry,
}: {
  children: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Alert
      variant="danger"
      action={
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      }
    >
      {children}
    </Alert>
  );
}
