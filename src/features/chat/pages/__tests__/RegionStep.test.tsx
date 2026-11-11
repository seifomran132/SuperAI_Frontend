import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import errorsAr from '~/i18n/errors.ar.json';
import { agentMock, agentPrompts, steps } from '~/mocks/agents';
import { brandKitsMock, graphicDesigner } from '~/mocks/brand-kits';
import { resetChatMock } from '~/mocks/chat';
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
const r = g.region;

async function start(first: ReturnType<typeof steps.region>) {
  agentMock.first = first;
  await renderApp('/chat');
  fireEvent.click(
    await screen.findByRole('button', {
      name: new RegExp(graphicDesigner.labelAr),
    }),
  );
  await screen.findByText(agentPrompts[first.step as string]!);
  return screen.findByRole('application', {
    name: r.canvasLabel[first.target as 'product' | 'logo'],
  });
}

describe('marking an area on the design (S30)', () => {
  it('needs a box before «متابعة»; Enter makes one, arrows move it', async () => {
    const canvas = await start(steps.region('product'));
    expect(screen.getByRole('button', { name: g.send })).toBeDisabled();
    // The product step is required: no skip.
    expect(screen.queryByRole('button', { name: r.skip })).toBeNull();
    fireEvent.keyDown(canvas, { key: 'Enter' });
    fireEvent.keyDown(canvas, { key: 'ArrowRight', shiftKey: true });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    await waitFor(() =>
      expect(agentMock.answers[0]).toMatchObject({
        step: 'edit_product_region',
        value: { region: { x: 0.35, y: 0.3, width: 0.4, height: 0.4 } },
      }),
    );
  });

  it('redraws from scratch and announces the box', async () => {
    const canvas = await start(steps.region('product'));
    fireEvent.keyDown(canvas, { key: 'Enter' });
    expect(
      screen.getByText(
        r.announce
          .replace('{{x}}', '30')
          .replace('{{y}}', '30')
          .replace('{{width}}', '40')
          .replace('{{height}}', '40'),
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: r.reset }));
    expect(screen.getByRole('button', { name: g.send })).toBeDisabled();
  });

  it('lets the logo step be skipped', async () => {
    await start(steps.region('logo'));
    fireEvent.click(screen.getByRole('button', { name: r.skip }));
    await waitFor(() =>
      expect(agentMock.answers[0]).toMatchObject({
        step: 'edit_logo_region',
        value: { skip: true },
      }),
    );
  });

  it('starts from the earlier box when redrawing from the summary', async () => {
    await start(
      steps.region('product', { x: 0.1, y: 0.2, width: 0.3, height: 0.3 }),
    );
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    await waitFor(() =>
      expect(agentMock.answers[0]?.value).toEqual({
        region: { x: 0.1, y: 0.2, width: 0.3, height: 0.3 },
      }),
    );
  });

  it('keeps the box and shows a refusal under the image', async () => {
    const canvas = await start(steps.region('product'));
    fireEvent.keyDown(canvas, { key: 'Enter' });
    agentMock.fail = { status: 400, code: 'VALIDATION_FAILED' };
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    expect(
      await screen.findByText(errorsAr.VALIDATION_FAILED),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: g.send })).toBeEnabled();
  });

  it('shows the marked box on the summary row', async () => {
    const canvas = await start(steps.region('product'));
    agentMock.next = [
      {
        type: 'summary',
        step: 'edit_summary',
        items: [
          {
            field: 'product_region',
            labelAr: 'مكان المنتج',
            labelEn: 'Product area',
            value: 'محدَّد',
            region: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
            assetId: 'design-1',
          },
        ],
        editable: ['product_region'],
        estimate: null,
      },
    ];
    fireEvent.keyDown(canvas, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    await screen.findByText('محدَّد');
    // One in the reply bubble, one on the summary row.
    await waitFor(() =>
      expect(screen.getAllByRole('img', { name: r.thumbnail })).toHaveLength(2),
    );
  });

  it('shows the marked design in the reply bubble', async () => {
    const canvas = await start(steps.region('product'));
    agentMock.next = [steps.brandName()];
    fireEvent.keyDown(canvas, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: g.send }));
    expect(
      await screen.findByRole('img', { name: r.thumbnail }),
    ).toBeInTheDocument();
  });
});
