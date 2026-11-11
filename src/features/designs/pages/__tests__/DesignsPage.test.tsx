import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { brandKitsMock, graphicDesigner, kit } from '~/mocks/brand-kits';
import { resetChatMock } from '~/mocks/chat';
import { design, designsMock, serveDesignImages } from '~/mocks/designs';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  brandKitsMock.agents = [graphicDesigner];
  brandKitsMock.kits = [
    kit('kit-1', { name: 'مقهى الندى' }),
    kit('kit-2', { name: 'عيادة سنا' }),
  ];
  URL.createObjectURL = vi.fn(() => 'blob:design');
  URL.revokeObjectURL = vi.fn();
  await signInDirectly();
});
afterEach(() => vi.restoreAllMocks());

const d = ar.designs;

function seed() {
  designsMock.designs = [
    design('a', { version: 2, needsReview: true }),
    design('b', {
      brandKitId: 'kit-2',
      format: 'instagram_story',
      aspectRatio: '9:16',
      conversationId: 'conv-2',
    }),
    design('c', { brandKitId: 'gone' }),
  ];
  serveDesignImages(designsMock.designs);
}

describe('DesignsPage', () => {
  it('lists designs with brand, format, version and the review note', async () => {
    seed();
    await renderApp('/designs');
    const main = await screen.findByRole('main');
    expect(await within(main).findAllByText('عيادة سنا')).not.toHaveLength(0);
    expect(within(main).getByText(d.deletedBrand)).toBeInTheDocument();
    expect(within(main).getByText('v2')).toBeInTheDocument();
    expect(within(main).getByText(d.needsReview)).toBeInTheDocument();
    expect(
      within(main).getByText(d.formats.instagram_story, { exact: false }),
    ).toBeInTheDocument();
    expect(
      within(main).getAllByRole('link', { name: d.openChat })[1],
    ).toHaveAttribute('href', '/chat/conv-2');
  });

  it('filters by brand', async () => {
    seed();
    await renderApp('/designs');
    await screen.findAllByText(d.deletedBrand);
    fireEvent.change(screen.getByLabelText(d.brandFilter), {
      target: { value: 'kit-2' },
    });
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: d.openChat })).toHaveLength(1),
    );
    expect(screen.queryByText(d.deletedBrand)).toBeNull();
  });

  it('downloads with the chosen type and size', async () => {
    seed();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await renderApp('/designs');
    const [first] = await screen.findAllByRole('button', {
      name: d.download.action,
    });
    fireEvent.click(first!);
    await waitFor(() =>
      expect(designsMock.exports).toEqual([
        { id: 'a', format: 'png', size: 'original' },
      ]),
    );
  });

  it('shows the empty state pointing to the chat', async () => {
    await renderApp('/designs');
    expect(await screen.findByText(d.emptyTitle)).toBeInTheDocument();
  });

  it('offers retry when the list fails', async () => {
    designsMock.failList = true;
    await renderApp('/designs');
    expect(await screen.findByText(d.loadError)).toBeInTheDocument();
    designsMock.failList = false;
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(await screen.findByText(d.emptyTitle)).toBeInTheDocument();
  });

  it('is linked from the sidebar where the plan offers the designer', async () => {
    await renderApp('/chat');
    const links = await screen.findAllByRole('link', {
      name: ar.shell.designs,
    });
    expect(links[0]).toHaveAttribute('href', '/designs');
  });
});
