import { fireEvent, screen } from '@testing-library/react';
import ar from '~/i18n/ar.json';

export const t = {
  auth: ar.auth,
  authErrors: ar.authErrors,
  common: ar.common,
};

/** Types into a field found by its visible label. */
export function fill(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

export const button = (name: string | RegExp) =>
  screen.getByRole('button', { name });
