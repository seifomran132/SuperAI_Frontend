import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { requestPasswordReset } from '../model/actions';
import { AuthLayout } from '../components/AuthLayout';
import { BackToSignIn } from '../components/BackToSignIn';
import { EmailField } from '../components/fields';
import { FormAlert } from '../components/FormAlert';
import { setPendingEmail } from '../model/pending-email';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../model/schemas';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setErrorKey(null);
    const result = await requestPasswordReset(values.email);
    if (result.errorKey) {
      setErrorKey(result.errorKey);
      return;
    }
    // Same outcome whether or not an account exists.
    setPendingEmail(values.email);
    await navigate({ to: '/check-email', search: { reason: 'reset' } });
  }

  return (
    <AuthLayout
      title={t('auth.forgotPassword.title')}
      subtitle={t('auth.forgotPassword.subtitle')}
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
          <EmailField />
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('auth.forgotPassword.submit')}
          </Button>
        </form>
      </Form>
      <BackToSignIn />
    </AuthLayout>
  );
}
