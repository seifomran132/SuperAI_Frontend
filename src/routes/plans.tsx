import { createFileRoute } from '@tanstack/react-router';
import { PlansPage } from '~/features/plans';

// Public (and prerendered): the session is only read after mount inside the page.
export const Route = createFileRoute('/plans')({
  component: PlansPage,
});
