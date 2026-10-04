import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { signOut } from '~/features/auth';

/** Signs out through the auth feature, then goes to the sign-in page. */
export function useSignOut() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const run = useCallback(async () => {
    setPending(true);
    const { errorKey } = await signOut();
    if (errorKey) {
      setPending(false);
      toast.error(t('common.unexpectedError'));
      return;
    }
    await navigate({ to: '/sign-in', replace: true });
  }, [navigate, t]);
  return { signOut: run, pending };
}
