import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { resetChatMock } from '~/mocks/chat';
import { brandKitsMock, kit } from '~/mocks/brand-kits';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

// One dialog per file: jsdom stalls on a second Radix dialog in the same file
// (see the admin catalog harness).
useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  await signInDirectly();
});

const d = ar.brandKits.delete;

it('deletes the kit only after confirming, then goes back to the list', async () => {
  brandKitsMock.kits = [kit('k1', { name: 'مقهى الندى' })];
  const { here } = await renderApp('/brands/k1');
  fireEvent.click(await screen.findByRole('button', { name: d.action }));
  const dialog = await screen.findByRole('dialog', {
    name: d.confirmTitle.replace('{{name}}', 'مقهى الندى'),
  });
  expect(brandKitsMock.calls).toHaveLength(0);
  fireEvent.click(within(dialog).getByRole('button', { name: d.confirm }));
  await waitFor(() => expect(here()).toBe('/brands'));
  expect(brandKitsMock.calls).toContainEqual({ name: 'delete', body: 'k1' });
  expect(await screen.findByText(ar.brandKits.emptyTitle)).toBeInTheDocument();
});
