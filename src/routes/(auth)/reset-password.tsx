import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from '~/features/auth';

// Public on purpose: the page itself requires a recovery session from the link.
export const Route = createFileRoute('/(auth)/reset-password')({
  component: ResetPasswordPage,
});
