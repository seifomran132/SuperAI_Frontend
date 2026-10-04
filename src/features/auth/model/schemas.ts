import { z } from 'zod';
import type { FieldErrorDto } from '~/api/generated/types.gen';

// Messages are i18n keys; <FormMessage> translates them.
const v = (key: string) => `auth.validation.${key}`;

const email = z
  .string()
  .trim()
  .pipe(z.email({ error: v('emailInvalid') }));
const fullName = z
  .string()
  .trim()
  .min(1, v('nameRequired'))
  .max(100, v('nameTooLong'));
const newPassword = z.string().min(8, v('passwordTooShort'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, v('passwordRequired')),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  fullName,
  email,
  password: newPassword,
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ password: newPassword, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    error: v('passwordMismatch'),
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

// The phone is validated by the API (it normalises and checks the format), so
// the server's `details` are the source of truth for its errors.
export const completeProfileSchema = z.object({
  fullName,
  phoneNumber: z.string().trim(),
});
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

/** Empty phone is sent as null, never as an empty string. */
export function toProfilePayload(values: CompleteProfileValues) {
  const phone = values.phoneNumber.trim();
  return {
    fullName: values.fullName.trim(),
    phoneNumber: phone === '' ? null : phone,
  };
}

const fieldErrorKeys = {
  fullName: v('nameRequired'),
  phoneNumber: v('phoneInvalid'),
} as const;

/** Maps `VALIDATION_FAILED.details` onto our form fields (unknown fields are ignored). */
export function fieldErrorsFromDetails(
  details: ReadonlyArray<FieldErrorDto> | undefined,
): Partial<Record<keyof typeof fieldErrorKeys, string>> {
  const result: Partial<Record<keyof typeof fieldErrorKeys, string>> = {};
  for (const d of details ?? []) {
    if (d.field in fieldErrorKeys) {
      const field = d.field as keyof typeof fieldErrorKeys;
      result[field] = fieldErrorKeys[field];
    }
  }
  return result;
}
