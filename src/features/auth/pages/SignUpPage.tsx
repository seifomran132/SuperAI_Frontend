import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextLink } from '~/components/TextLink';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { signUpWithEmail } from '../model/actions';
import { AuthLayout } from '../components/AuthLayout';
import { EmailField, NameField, PasswordField } from '../components/fields';
import { FormAlert } from '../components/FormAlert';
import { setPendingEmail } from '../model/pending-email';
import { signUpSchema, type SignUpValues } from '../model/schemas';

export function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  async function onSubmit(values: SignUpValues) {
    setErrorKey(null);
    const result = await signUpWithEmail(values);
    if (result.errorKey === 'authErrors.weakPassword') {
      form.setError('password', { message: result.errorKey });
      return;
    }
    if (result.errorKey) {
      setErrorKey(result.errorKey);
      return;
    }
    // GoTrue answers the same way for an existing email, so we always end here.
    setPendingEmail(values.email);
    await navigate({ to: '/check-email', search: { reason: 'signup' } });
  }

  return (
    <AuthLayout
      title={t('auth.signUp.title')}
      subtitle={t('auth.signUp.subtitle')}
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
          <NameField />
          <EmailField />
          <PasswordField
            label={t('auth.fields.password')}
            autoComplete="new-password"
            showHint
          />
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('auth.signUp.submit')}
          </Button>
        </form>
      </Form>
      <p className="text-fg-muted mt-6 flex flex-wrap items-center justify-center gap-x-2 text-sm">
        <span>{t('auth.signUp.haveAccount')}</span>
        <TextLink to="/sign-in">{t('auth.signUp.signInLink')}</TextLink>
      </p>
    </AuthLayout>
  );
}
