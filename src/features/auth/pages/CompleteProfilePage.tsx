import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isApiError } from '~/api/errors';
import {
  meControllerGetQueryKey,
  meControllerUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { AuthLayout } from '../components/AuthLayout';
import { NameField } from '../components/fields';
import { FormAlert } from '../components/FormAlert';
import { unavailableReason } from '../model/me';
import { safeRedirect } from '../model/redirect';
import {
  completeProfileSchema,
  fieldErrorsFromDetails,
  toProfilePayload,
  type CompleteProfileValues,
} from '../model/schemas';

export function CompleteProfilePage({ redirect }: { redirect?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const update = useMutation(meControllerUpdateMutation());
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const form = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { fullName: '', phoneNumber: '' },
  });

  async function onSubmit(values: CompleteProfileValues) {
    setErrorKey(null);
    try {
      const me = await update.mutateAsync({ body: toProfilePayload(values) });
      queryClient.setQueryData(meControllerGetQueryKey(), me);
      router.history.push(safeRedirect(redirect));
    } catch (error) {
      const reason = unavailableReason(error);
      if (reason) {
        await navigate({ to: '/account-unavailable', search: { reason } });
        return;
      }
      if (isApiError(error) && error.code === 'VALIDATION_FAILED') {
        const fields = fieldErrorsFromDetails(error.details);
        const entries = Object.entries(fields);
        if (entries.length > 0) {
          for (const [field, message] of entries) {
            form.setError(field as keyof CompleteProfileValues, { message });
          }
          return;
        }
      }
      setErrorKey(
        isApiError(error) ? `errors:${error.code}` : 'common.networkError',
      );
    }
  }

  return (
    <AuthLayout
      title={t('auth.completeProfile.title')}
      subtitle={t('auth.completeProfile.subtitle')}
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
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>{t('auth.fields.phone')}</FormLabel>
                  <span className="bg-surface-muted text-fg-muted rounded-sm px-2 text-sm leading-6">
                    {t('auth.fields.optional')}
                  </span>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t('auth.fields.phoneExample')}
                  />
                </FormControl>
                <FormDescription>
                  {t('auth.completeProfile.phoneHint')}{' '}
                  <bdi dir="ltr">{t('auth.fields.phoneExample')}</bdi>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('auth.completeProfile.submit')}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
