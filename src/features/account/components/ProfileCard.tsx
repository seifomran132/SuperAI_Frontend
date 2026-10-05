import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isApiError } from '~/api/errors';
import {
  meControllerGetOptions,
  meControllerGetQueryKey,
  meControllerUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import type { MeResponse } from '~/api/generated/types.gen';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  FormAlert,
  completeProfileSchema,
  fieldErrorsFromDetails,
  toProfilePayload,
  type CompleteProfileValues,
} from '~/features/auth/ui';
import { Card } from './Card';

function ProfileForm({ me }: { me: MeResponse }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const update = useMutation(meControllerUpdateMutation());
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const form = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      fullName: me.fullName ?? '',
      phoneNumber: me.phoneNumber ?? '',
    },
  });

  async function onSubmit(values: CompleteProfileValues) {
    setErrorKey(null);
    try {
      const saved = await update.mutateAsync({
        body: toProfilePayload(values),
      });
      queryClient.setQueryData(meControllerGetQueryKey(), saved);
      form.reset({
        fullName: saved.fullName ?? '',
        phoneNumber: saved.phoneNumber ?? '',
      });
      toast.success(t('account.profile.saved'));
    } catch (error) {
      if (isApiError(error) && error.code === 'VALIDATION_FAILED') {
        const entries = Object.entries(fieldErrorsFromDetails(error.details));
        if (entries.length > 0) {
          for (const [field, message] of entries) {
            form.setError(field as keyof CompleteProfileValues, { message });
          }
          return;
        }
      }
      // Typed values stay in the form so the user can retry.
      setErrorKey(
        isApiError(error) ? `errors:${error.code}` : 'account.profile.failed',
      );
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-5"
      >
        <FormAlert errorKey={errorKey} />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.fields.fullName')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel>{t('auth.fields.phone')}</FormLabel>
                <span className="text-fg-muted text-sm">
                  {t('account.profile.optional')}
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
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-2">
          <label
            htmlFor="account-email"
            className="text-fg text-sm font-medium"
          >
            {t('auth.fields.email')}
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="text-fg-subtle pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2"
            />
            <Input
              id="account-email"
              readOnly
              dir="ltr"
              value={me.email ?? ''}
              className="bg-surface-muted ps-10"
            />
          </div>
          <p className="text-fg-muted text-sm">
            {t('account.profile.emailNote')}
          </p>
        </div>
        <Button
          type="submit"
          loading={form.formState.isSubmitting}
          className="w-full sm:w-auto sm:self-start"
        >
          {t('account.profile.save')}
        </Button>
      </form>
    </Form>
  );
}

/** Name and phone are editable; the email is read-only. */
export function ProfileCard() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useQuery(
    meControllerGetOptions(),
  );
  let body;
  if (data) {
    body = <ProfileForm me={data} />;
  } else if (isError) {
    body = (
      <RetryAlert onRetry={() => void refetch()}>
        {t('account.loadError')}
      </RetryAlert>
    );
  } else {
    body = (
      <div
        role="status"
        aria-busy={isPending}
        aria-label={t('common.loading')}
        className="grid gap-5"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-surface-muted h-12 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }
  return <Card title={t('account.profile.title')}>{body}</Card>;
}
