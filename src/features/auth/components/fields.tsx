import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { PasswordInput } from '~/components/ui/password-input';

// Field wrappers shared by the auth forms. Values are typed in the page's
// form; these only wire label, control, hint and error together.

export function NameField({ name = 'fullName' }: { name?: string }) {
  const { control } = useFormContext();
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('auth.fields.fullName')}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="text"
              autoComplete="name"
              placeholder={t('auth.fields.fullNamePlaceholder')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EmailField({ name = 'email' }: { name?: string }) {
  const { control } = useFormContext();
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('auth.fields.email')}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              placeholder={t('auth.fields.emailPlaceholder')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface PasswordFieldProps {
  name?: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  /** Shows "8 characters at least" under the field before the user types. */
  showHint?: boolean;
  /** Extra content on the label row's end side (e.g. the forgot-password link). */
  labelAside?: ReactNode;
}

export function PasswordField({
  name = 'password',
  label,
  autoComplete,
  showHint = false,
  labelAside,
}: PasswordFieldProps) {
  const { control } = useFormContext();
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {labelAside ? (
            <div className="flex items-center justify-between gap-3">
              <FormLabel>{label}</FormLabel>
              {labelAside}
            </div>
          ) : (
            <FormLabel>{label}</FormLabel>
          )}
          <FormControl>
            <PasswordInput
              {...field}
              autoComplete={autoComplete}
              placeholder="••••••••"
            />
          </FormControl>
          {showHint ? (
            <FormDescription>{t('auth.fields.passwordHint')}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
