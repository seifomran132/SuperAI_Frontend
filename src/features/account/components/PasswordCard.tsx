import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import {
  FormAlert,
  PasswordField,
  resetPasswordSchema,
  updatePassword,
  type ResetPasswordValues,
} from '~/features/auth';
import { Card } from './Card';

/** Same rules and GoTrue errors as the reset-password page. */
export function PasswordCard() {
  const { t } = useTranslation();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

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
    form.reset();
    toast.success(t('account.password.saved'));
  }

  return (
    <Card title={t('account.password.title')}>
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
          <Button
            type="submit"
            loading={form.formState.isSubmitting}
            className="w-full sm:w-auto sm:self-start"
          >
            {t('account.password.save')}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
