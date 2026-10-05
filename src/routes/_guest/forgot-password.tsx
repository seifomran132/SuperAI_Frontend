import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordPage } from '~/features/auth/ui';

export const Route = createFileRoute('/_guest/forgot-password')({
  component: ForgotPasswordPage,
});
