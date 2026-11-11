import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agentMock, agentPrompts, steps } from '~/mocks/agents';
import { brandKitsMock, graphicDesigner } from '~/mocks/brand-kits';
import { chatMock, message, resetChatMock } from '~/mocks/chat';
import { designsMock, serveDesignImages } from '~/mocks/designs';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  brandKitsMock.agents = [graphicDesigner];
  URL.createObjectURL = vi.fn(() => 'blob:design');
  URL.revokeObjectURL = vi.fn();
  await signInDirectly();
});
afterEach(() => vi.restoreAllMocks());

const g = ar.chat.agent;
const two = [
  { outputId: 'out-1', attachmentId: 'att-1' },
  { outputId: 'out-2', attachmentId: 'att-2', version: 2, needsReview: true },
];

async function start(first: ReturnType<(typeof steps)[keyof typeof steps]>) {
  agentMock.first = first;
  await renderApp('/chat');
  fireEvent.click(
    await screen.findByRole('button', {
      name: new RegExp(graphicDesigner.labelAr),
    }),
  );
  await screen.findByText(agentPrompts[first.step as string]!, {
    exact: false,
  });
  await waitFor(() =>
    expect(document.querySelector('[data-agent-dock]')).not.toBeNull(),
  );
  return chatMock.conversations.at(-1)!.id;
}

/** The server finishes: a results message lands in the conversation. */
function deliver(conversationId: string, designs = two, extra: object = {}) {
  serveDesignImages(designs);
  const list = chatMock.messages[conversationId]!;
  list.push(
    message({
      sequence: list.length + 1,
      role: 'assistant',
      content: agentPrompts.design_results!,
      modeKey: null,
      ui: {
        ...steps.results(designs),
        prompt: {
          ar: agentPrompts.design_results,
          en: 'Here are your designs.',
        },
        ...extra,
      },
    }),
  );
}

describe('making designs', () => {
  it('shows progress, re-reads the conversation and shows the results', async () => {
    const id = await start(steps.progress(1, 2));
    expect(screen.getByText(g.working)).toBeInTheDocument();
    expect(
      screen.getByText(
        g.workingCount.replace('{{done}}', '1').replace('{{total}}', '2'),
      ),
    ).toBeInTheDocument();
    // No input while it works.
    expect(screen.getByText(g.leaveNote)).toBeInTheDocument();
    deliver(id);
    expect(
      await screen.findByText(g.ready, {}, { timeout: 6000 }),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(2));
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText(ar.designs.needsReview)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تصميم جديد' })).toBeEnabled();
  });

  it('edits a delivered design and downloads one as PNG, original size', async () => {
    const id = await start(steps.progress(0, 2));
    deliver(id);
    await screen.findByText(g.ready, {}, { timeout: 6000 });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    fireEvent.click(
      screen.getAllByRole('button', {
        name: g.downloadLabel.replace('{{n}}', '1'),
      })[0]!,
    );
    await waitFor(() =>
      expect(designsMock.exports).toEqual([
        { id: 'out-1', format: 'png', size: 'original' },
      ]),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: g.editDesignLabel.replace('{{n}}', '2'),
      }),
    );
    await waitFor(() =>
      expect(agentMock.answers.at(-1)).toMatchObject({
        step: 'design_results',
        value: { action: 'edit', outputId: 'out-2' },
      }),
    );
  });

  it('keeps «تعديل» off on older results while another step is current', async () => {
    const id = await start(steps.progress(0, 2));
    deliver(id);
    agentMock.next = [steps.brandName()];
    await screen.findByText(g.ready, {}, { timeout: 6000 });
    fireEvent.click(screen.getByRole('button', { name: 'تصميم جديد' }));
    await screen.findByText(agentPrompts.brand_name!);
    expect(
      screen.getByRole('button', {
        name: g.editDesignLabel.replace('{{n}}', '1'),
      }),
    ).toBeDisabled();
    expect(screen.getAllByText(g.finishStepFirst)[0]).toBeInTheDocument();
  });

  it('says when nothing came out and offers to try again', async () => {
    const id = await start(steps.progress(0, 2));
    deliver(id, []);
    expect(
      await screen.findByText(g.noResults, { exact: false }, { timeout: 6000 }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'حاول مرة أخرى' }));
    await waitFor(() =>
      expect(agentMock.answers.at(-1)?.value).toEqual({ action: 'try_again' }),
    );
  });

  it('explains when designs can’t be made right now', async () => {
    await start(steps.summary(null));
    agentMock.fail = { status: 409, code: 'AGENT_NOT_READY' };
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(await screen.findByText(g.notReady)).toBeInTheDocument();
  });

  it('turns a balance refusal into the balance note, never a price', async () => {
    await start(steps.summary(null));
    agentMock.fail = {
      status: 409,
      code: 'INSUFFICIENT_BALANCE',
      data: { fitsVariants: 0, estimatedCostUsd: '0.12', balanceUsd: '0.01' },
    };
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(
      await screen.findByText(g.fitsNone, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: g.create })).toBeDisabled();
    expect(
      document.querySelector('[data-agent-dock]')!.textContent,
    ).not.toMatch(/\$/);
  });
});

describe('editing a design', () => {
  it('sends several changes with a description', async () => {
    await start(steps.changes());
    expect(screen.getByRole('button', { name: g.send })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'استبدال الشعار' }));
    fireEvent.click(screen.getByRole('button', { name: 'تغيير النص' }));
    expect(screen.getByRole('button', { name: 'تغيير النص' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.change(screen.getByLabelText(g.orDescribe), {
      target: { value: 'خلفية أفتح' },
    });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({
        choices: ['replace_logo', 'change_text'],
        text: 'خلفية أفتح',
      }),
    );
  });

  it('confirms with «عدّله» or cancels the edit', async () => {
    await start(steps.editSummary());
    expect(screen.getByRole('button', { name: g.editIt })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: g.cancel }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({ action: 'cancel' }),
    );
  });
});
