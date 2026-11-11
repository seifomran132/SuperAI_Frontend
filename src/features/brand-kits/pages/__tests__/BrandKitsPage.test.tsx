import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetChatMock } from '~/mocks/chat';
import { asset, brandKitsMock, graphicDesigner, kit } from '~/mocks/brand-kits';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  await signInDirectly();
});

const b = ar.brandKits;

describe('BrandKitsPage', () => {
  it('lists kits with their draft badge, colours and file count', async () => {
    brandKitsMock.kits = [
      kit('k1', { name: 'مقهى الندى', assets: [asset('a1'), asset('a2')] }),
      kit('k2', { name: 'متجر زهرة', status: 'draft', colors: [] }),
    ];
    await renderApp('/brands');
    const first = await screen.findByRole('link', { name: /مقهى الندى/ });
    expect(first).toHaveAttribute('href', '/brands/k1');
    expect(within(first).getByText(b.files_two)).toBeInTheDocument();
    const draft = screen.getByRole('link', { name: /متجر زهرة/ });
    expect(within(draft).getByText(b.draft)).toBeInTheDocument();
    expect(within(draft).getByText(b.files_zero)).toBeInTheDocument();
  });

  it('shows the empty state pointing to the chat', async () => {
    await renderApp('/brands');
    expect(await screen.findByText(b.emptyTitle)).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).getByRole('link', { name: b.startChat }),
    ).toHaveAttribute('href', '/chat');
  });

  it('offers retry when the list fails', async () => {
    brandKitsMock.failList = true;
    await renderApp('/brands');
    expect(await screen.findByText(b.loadError)).toBeInTheDocument();
    brandKitsMock.failList = false;
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(await screen.findByText(b.emptyTitle)).toBeInTheDocument();
  });

  it('disables «هوية جديدة» at the plan limit and links to plans', async () => {
    brandKitsMock.limit = 1;
    brandKitsMock.kits = [kit('k1')];
    await renderApp('/brands');
    await screen.findByRole('link', { name: /هوية k1/ });
    expect(screen.getByRole('button', { name: b.new })).toBeDisabled();
    expect(
      screen.getByText(b.limitReached.replace('{{count}}', '1'), {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: b.viewPlans })).toHaveAttribute(
      'href',
      '/plans',
    );
  });

  it('creates a kit from its name and opens it', async () => {
    const { here } = await renderApp('/brands');
    fireEvent.click(await screen.findByRole('button', { name: b.new }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: b.newDialog.create }),
    );
    expect(
      await within(dialog).findByText(b.identity.required),
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText(b.identity.label), {
      target: { value: '  عيادة سنا ' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: b.newDialog.create }),
    );
    await waitFor(() => expect(here()).toMatch(/^\/brands\/new-/));
    expect(brandKitsMock.calls).toContainEqual({
      name: 'create',
      body: { name: 'عيادة سنا' },
    });
  });
});

describe('the «علاماتي التجارية» link', () => {
  it('is hidden while the plan does not offer the graphic designer', async () => {
    await renderApp('/chat');
    await screen.findAllByRole('link', { name: ar.shell.balance });
    expect(screen.queryByRole('link', { name: ar.shell.brands })).toBeNull();
  });

  it('appears in the sidebar when it does', async () => {
    brandKitsMock.agents = [graphicDesigner];
    await renderApp('/chat');
    const links = await screen.findAllByRole('link', { name: ar.shell.brands });
    expect(links[0]).toHaveAttribute('href', '/brands');
  });
});
