import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { useSignOut } from '~/features/chat/mode-ui';
import { Card } from './Card';

export function SessionCard() {
  const { t } = useTranslation();
  const { signOut, pending } = useSignOut();
  return (
    <Card title={t('account.session.title')}>
      <p className="text-fg-muted text-base">{t('account.session.body')}</p>
      <Button
        type="button"
        variant="secondary"
        loading={pending}
        onClick={() => void signOut()}
        className="w-full sm:w-auto sm:self-start"
      >
        <LogOut aria-hidden="true" className="rtl:-scale-x-100" />
        {t('account.session.signOut')}
      </Button>
    </Card>
  );
}
