import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { agentMock, agentPrompts, steps } from '~/mocks/agents';
import { brandKitsMock, graphicDesigner } from '~/mocks/brand-kits';
import { chatCalls, resetChatMock } from '~/mocks/chat';
import errorsAr from '~/i18n/errors.ar.json';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  brandKitsMock.agents = [graphicDesigner];
  await signInDirectly();
});

const g = ar.chat.agent;

/** Opens /chat, starts the graphic designer from its card, waits for the first question. */
async function start(
  first = steps.brandName(),
  next: ReturnType<(typeof steps)[keyof typeof steps]>[] = [],
) {
  agentMock.first = first;
  agentMock.next = [...next];
  const app = await renderApp('/chat');
  fireEvent.click(
    await screen.findByRole('button', {
      name: new RegExp(graphicDesigner.labelAr),
    }),
  );
  await screen.findByText(agentPrompts[first.step as string]!);
  // The step input loads lazily with the first agent conversation.
  await waitFor(() =>
    expect(document.querySelector('[data-agent-dock]')).not.toBeNull(),
  );
  return app;
}

const answerBox = () => screen.getByLabelText(g.inputLabel);

describe('the graphic designer in the chat', () => {
  it('is hidden when the plan offers no agent', async () => {
    brandKitsMock.agents = [];
    await renderApp('/chat');
    await screen.findByText(ar.chat.empty.title);
    expect(
      screen.queryByRole('button', {
        name: new RegExp(graphicDesigner.labelAr),
      }),
    ).toBeNull();
  });

  it('starts its own conversation and replaces the composer with the step input', async () => {
    const { here } = await start();
    await waitFor(() => expect(here()).toMatch(/^\/chat\/.+/));
    expect(chatCalls('createConversation')[0]?.body).toEqual({
      agentKey: 'graphic_designer',
    });
    expect(await screen.findByLabelText(g.inputLabel)).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: ar.chat.composer.label }),
    ).toBeNull();
  });

  it('sends a text answer, shows the reply and only the newest question is answerable', async () => {
    await start(steps.brandName(), [steps.style()]);
    fireEvent.change(answerBox(), { target: { value: '  مقهى الندى ' } });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    expect(
      await screen.findByText(agentPrompts.brand_style!),
    ).toBeInTheDocument();
    expect(screen.getByText('مقهى الندى')).toBeInTheDocument();
    const [sent] = agentMock.answers;
    expect(sent).toMatchObject({
      step: 'brand_name',
      value: { text: 'مقهى الندى' },
    });
    expect(sent!.clientRequestId).toMatch(/^[0-9a-f-]{36}$/);
    // The old text input is gone; the choices of the new step are there.
    expect(screen.queryByLabelText(g.inputLabel)).toBeNull();
    expect(
      screen.getByRole('button', { name: 'بسيط وهادئ' }),
    ).toBeInTheDocument();
  });

  it('keeps the answer and shows the refusal under the input', async () => {
    await start();
    agentMock.fail = { status: 400, code: 'VALIDATION_FAILED' };
    fireEvent.change(answerBox(), { target: { value: 'اسم' } });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      errorsAr.VALIDATION_FAILED,
    );
    expect(answerBox()).toHaveValue('اسم');
  });

  it('retries a network failure with the same clientRequestId', async () => {
    await start();
    agentMock.fail = 'network';
    fireEvent.change(answerBox(), { target: { value: 'اسم' } });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    fireEvent.click(await screen.findByRole('button', { name: g.retry }));
    await screen.findByText(agentPrompts.design_results!, { exact: false });
    expect(agentMock.answers).toHaveLength(2);
    expect(agentMock.answers[1]!.clientRequestId).toBe(
      agentMock.answers[0]!.clientRequestId,
    );
  });

  it('reloads the messages when the conversation moved on', async () => {
    await start();
    agentMock.fail = { status: 409, code: 'AGENT_STEP_MISMATCH' };
    fireEvent.change(answerBox(), { target: { value: 'اسم' } });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    expect(await screen.findByText(g.moved)).toBeInTheDocument();
    await waitFor(() =>
      expect(chatCalls('listMessages').length).toBeGreaterThan(1),
    );
  });

  it('explains when the plan no longer offers the agent', async () => {
    await start();
    agentMock.fail = { status: 409, code: 'AGENT_NOT_AVAILABLE' };
    fireEvent.change(answerBox(), { target: { value: 'اسم' } });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    expect(await screen.findByText(g.notAvailable)).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: g.viewPlans })[0],
    ).toHaveAttribute('href', '/plans');
  });

  it('offers the logo colours and sends the palette most important first', async () => {
    await start(steps.colors(['#7A3E1D'], ['#E8B04B']));
    fireEvent.click(
      screen.getByRole('button', {
        name: ar.brandKits.colors.addSuggestedLabel.replace(
          '{{hex}}',
          '#E8B04B',
        ),
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({
        colors: ['#7A3E1D', '#E8B04B'],
      }),
    );
  });

  it('answers a choice, or free text when allowed', async () => {
    await start(steps.style(), [steps.style()]);
    fireEvent.click(screen.getByRole('button', { name: 'جريء وملفت' }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({ choice: 'bold' }),
    );
    await waitFor(() =>
      expect(screen.getAllByText(agentPrompts.brand_style!)).toHaveLength(2),
    );
    fireEvent.change(screen.getByLabelText(g.orDescribe), {
      target: { value: 'دافئ' },
    });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    await waitFor(() =>
      expect(agentMock.answers[1]?.value).toEqual({ text: 'دافئ' }),
    );
  });

  it('picks a brand, and «علامة جديدة» is off at the plan limit', async () => {
    await start(steps.picker(false));
    expect(
      screen.getByRole('button', { name: new RegExp(g.newBrand) }),
    ).toBeDisabled();
    expect(
      screen.getByText(g.limitReached, { exact: false }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /مقهى الندى/ }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({ brandKitId: 'kit-1' }),
    );
  });

  it('sends empty fields as «بدون نص»', async () => {
    await start(steps.text());
    fireEvent.click(screen.getByRole('button', { name: g.noText }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({
        headline: '',
        subtext: '',
      }),
    );
  });

  it('shows no blocked input beyond a link to plans', async () => {
    await start(steps.blocked());
    expect(screen.getByText(g.limitReached)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: g.send })).toBeNull();
  });
});

describe('the request summary', () => {
  it('shows no price, and changes one item on «تعديل»', async () => {
    await start(steps.summary(null));
    const dock = screen
      .getByRole('button', { name: g.create })
      .closest('div')!.parentElement!;
    expect(within(dock).queryByText(/\$/)).toBeNull();
    expect(screen.getByText(g.noText)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: g.editLabel.replace('{{label}}', 'النوع'),
      }),
    );
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({
        action: 'edit',
        field: 'format',
      }),
    );
  });

  it('makes as many designs as the balance covers', async () => {
    await start(steps.summary({ variants: 2, fitsVariants: 1 }));
    expect(
      screen.getByText(g.fitsSome_one.replace('{{variants}}', '2')),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: g.createSome_one }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({
        action: 'confirm',
        variants: 1,
      }),
    );
  });

  it('blocks confirming when the balance covers none', async () => {
    await start(steps.summary({ variants: 2, fitsVariants: 0 }));
    expect(screen.getByText(g.fitsNone, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: g.create })).toBeDisabled();
    const note = screen
      .getByText(g.fitsNone, { exact: false })
      .closest('[role=alert]')!;
    expect(
      within(note as HTMLElement).getByRole('link', { name: g.balance }),
    ).toHaveAttribute('href', '/balance');
    fireEvent.click(screen.getByRole('button', { name: g.anotherBrand }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({ action: 'change_brand' }),
    );
  });
});
