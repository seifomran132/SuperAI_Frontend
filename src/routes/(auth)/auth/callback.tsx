import { createFileRoute } from '@tanstack/react-router';
import { CallbackPage } from '~/features/auth/ui';

export const Route = createFileRoute('/(auth)/auth/callback')({
  component: CallbackPage,
});
