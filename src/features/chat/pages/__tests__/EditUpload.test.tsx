import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { agentMock } from '~/mocks/agents';
import { asset, brandKitsMock, graphicDesigner } from '~/mocks/brand-kits';
import { resetChatMock } from '~/mocks/chat';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

const uploadFile = vi.hoisted(() => vi.fn());
vi.mock('~/platform/upload', () => ({ uploadFile }));

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  uploadFile.mockReset();
  brandKitsMock.agents = [graphicDesigner];
  await signInDirectly();
});

// «تعديل تصميم موجود» (§11.2): the backend refuses a file of any other kind.
it('uploads the design to edit with kind `design` and answers with its id', async () => {
  uploadFile.mockResolvedValue({
    status: 201,
    body: { asset: asset('d1', { kind: 'design' }), suggestedColors: [] },
  });
  agentMock.first = {
    type: 'upload',
    step: 'edit_upload',
    brandKitId: 'kit-1',
    kinds: ['design'],
    maxFiles: 1,
    optional: false,
  };
  await renderApp('/chat');
  fireEvent.click(
    await screen.findByRole('button', {
      name: new RegExp(graphicDesigner.labelAr),
    }),
  );
  await waitFor(() =>
    expect(document.querySelector('[data-agent-dock]')).not.toBeNull(),
  );
  const input = document.querySelector<HTMLInputElement>(
    '[data-agent-dock] input[type=file]:not([capture])',
  )!;
  expect(input.multiple).toBe(false);
  fireEvent.change(input, {
    target: { files: [new File(['x'], 'post.png', { type: 'image/png' })] },
  });
  await waitFor(() =>
    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:3000/api/v1/me/brand-kits/kit-1/assets?kind=design',
      }),
    ),
  );
  fireEvent.click(
    await screen.findByRole('button', { name: ar.chat.agent.send }),
  );
  await waitFor(() =>
    expect(agentMock.answers[0]).toMatchObject({
      step: 'edit_upload',
      value: { assetIds: ['d1'] },
    }),
  );
});
