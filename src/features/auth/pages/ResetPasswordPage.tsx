import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { auth, initialLink } from '~/lib/auth/client';
import { hasLinkError } from '~/lib/auth/link-params';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { updatePassword } from '../model/actions';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordField } from '../components/fields';
import { FormAlert } from '../components/FormAlert';
import { LinkExpired } from '../components/LinkExpired';
import { defaultAfterAuthPath } from '../model/redirect';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '../model/schemas';
import { clearRecoverySession, hasRecoverySession } from '../model/session';

type LinkState = 'checking' | 'ready' | 'expired';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [linkState, setLinkState] = useState<LinkState>('checking');
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // Only a session that came from a recovery link may set a new password;
  // an ordinary signed-in session or none shows the expired state.
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (hasLinkError(initialLink)) {
        setLinkState('expired');
        return;
      }
      await auth.initialize();
      const { data } = await auth.getSession();
      if (cancelled) return;
      const recovery = hasRecoverySession() || initialLink.type === 'recovery';
      setLinkState(data.session && recovery ? 'ready' : 'expired');
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    setErrorKey(null);
    const result = await updatePassword(values.password);
    if (
      result.errorKey === 'authErrors.samePassword' ||
      result.errorKey === 'authErrors.weakPassword'
    ) {
      form.setError('password', { message: result.errorKey });
      return;
    }
    if (result.errorKey) {
      setErrorKey(result.errorKey);
      return;
    }
    clearRecoverySession();
    toast.success(t('auth.resetPassword.saved'));
    router.history.push(defaultAfterAuthPath);
  }

  if (linkState === 'expired') return <LinkExpired kind="reset" />;
  if (linkState === 'checking') {
    return (
      <AuthLayout>
        <p
          role="status"
          className="text-fg-muted flex items-center justify-center gap-3 py-6 text-base"
        >
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          {t('common.loading')}
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('auth.resetPassword.title')}
      subtitle={t('auth.resetPassword.subtitle')}
    >
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-5"
        >
          <FormAlert
            errorKey={errorKey}
            onRetry={() => void form.handleSubmit(onSubmit)()}
          />
          <PasswordField
            label={t('auth.fields.newPassword')}
            autoComplete="new-password"
            showHint
          />
          <PasswordField
            name="confirmPassword"
            label={t('auth.fields.confirmPassword')}
            autoComplete="new-password"
          />
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('auth.resetPassword.submit')}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
