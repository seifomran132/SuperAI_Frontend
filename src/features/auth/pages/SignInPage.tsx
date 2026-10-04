import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextLink } from '~/components/TextLink';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { resendSignupEmail, signInWithPassword } from '../model/actions';
import { AuthLayout } from '../components/AuthLayout';
import { EmailField, PasswordField } from '../components/fields';
import { FormAlert } from '../components/FormAlert';
import { setPendingEmail } from '../model/pending-email';
import { safeRedirect } from '../model/redirect';
import { signInSchema, type SignInValues } from '../model/schemas';

export function SignInPage({ redirect }: { redirect?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const navigate = useNavigate();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: SignInValues) {
    setErrorKey(null);
    const result = await signInWithPassword(values.email, values.password);
    if (result.errorKey) {
      setErrorKey(result.errorKey);
      return;
    }
    // The _authed guard then checks /me (profile, blocked accounts).
    router.history.push(safeRedirect(redirect));
  }

  async function resendConfirmation() {
    // Same validation as the form: no request without a valid address.
    if (!(await form.trigger('email'))) return;
    const email = form.getValues('email').trim();
    setResending(true);
    const result = await resendSignupEmail(email);
    setResending(false);
    if (result.errorKey) {
      setErrorKey(result.errorKey);
      return;
    }
    setPendingEmail(email);
    await navigate({ to: '/check-email', search: { reason: 'signup' } });
  }

  const unconfirmed = errorKey === 'authErrors.emailNotConfirmed';

  return (
    <AuthLayout
      title={t('auth.signIn.title')}
      subtitle={t('auth.signIn.subtitle')}
    >
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-5"
        >
          <FormAlert
            errorKey={errorKey}
            tone={unconfirmed ? 'warning' : 'danger'}
            onRetry={() => void form.handleSubmit(onSubmit)()}
            action={
              unconfirmed ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={resending}
                  onClick={() => void resendConfirmation()}
                >
                  {t('auth.signIn.resendConfirmation')}
                </Button>
              ) : undefined
            }
          />
          <EmailField />
          <PasswordField
            label={t('auth.fields.password')}
            autoComplete="current-password"
            labelAside={
              <TextLink to="/forgot-password">
                {t('auth.signIn.forgotPassword')}
              </TextLink>
            }
          />
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('auth.signIn.submit')}
          </Button>
        </form>
      </Form>
      <p className="text-fg-muted mt-6 flex flex-wrap items-center justify-center gap-x-2 text-sm">
        <span>{t('auth.signIn.noAccount')}</span>
        <TextLink to="/sign-up">{t('auth.signIn.signUpLink')}</TextLink>
      </p>
    </AuthLayout>
  );
}
