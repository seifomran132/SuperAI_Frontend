import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogMock, model } from '~/mocks/admin-catalog';
import { adminAgent, agentMock } from '~/mocks/agents';
import { renderApp } from '~/test/render-app';
import {
  a as text,
  reasonField,
  useCatalogSession,
} from '../../../catalog/__tests__/harness';

useCatalogSession();

const g = text.agents;

// One dialog per file (see the catalog harness).
describe('AgentsPage', () => {
  it('lists the agent with its status, plans and readiness, then saves models and plans with a reason', async () => {
    agentMock.admin = [
      adminAgent({ isEnabled: true, planKeys: [], ready: false }),
    ];
    catalogMock.models = [
      { ...model('text1'), displayName: 'نص' },
      { ...model('img1'), displayName: 'صور', generatesImages: true },
      { ...model('vis1'), displayName: 'فحص', supportsImages: true },
    ];
    await renderApp('/admin/agents');

    const row = (await screen.findByText('مصمم جرافيك')).closest('tr')!;
    expect(within(row).getByText(g.on)).toBeInTheDocument();
    expect(within(row).getByText(g.notReady)).toBeInTheDocument();
    expect(within(row).getByText(g.onNoPlans)).toBeInTheDocument();

    fireEvent.click(
      within(row).getByRole('button', {
        name: g.editLabel.replace('{{name}}', 'مصمم جرافيك'),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(g.noPlansWarning)).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        g.missing.replace(
          '{{models}}',
          [g.promptModel, g.imageModel, g.checkModel].join('، '),
        ),
        { exact: false },
      ),
    ).toBeInTheDocument();

    // Each picker lists only the models that fit its job.
    const prompt = within(dialog).getByLabelText(new RegExp(g.promptModel));
    await within(prompt).findByText('نص');
    expect(within(prompt).queryByText('صور')).toBeNull();
    fireEvent.change(prompt, { target: { value: 'text1' } });
    const image = within(dialog).getByLabelText(new RegExp(g.imageModel));
    expect(within(image).queryByText('نص')).toBeNull();
    fireEvent.change(image, { target: { value: 'img1' } });
    fireEvent.change(within(dialog).getByLabelText(new RegExp(g.checkModel)), {
      target: { value: 'vis1' },
    });
    fireEvent.click(await within(dialog).findByLabelText(/^باقة pro/));
    fireEvent.change(
      within(dialog).getByLabelText(
        new RegExp(`^${g.margin.replace(/[()%]/g, '.')}`),
      ),
      {
        target: { value: '45' },
      },
    );
    fireEvent.change(reasonField(), { target: { value: 'تجربة المصمم' } });
    fireEvent.click(within(dialog).getByRole('button', { name: g.save }));

    await waitFor(() => expect(agentMock.adminCalls).toHaveLength(1));
    expect(agentMock.adminCalls[0]).toMatchObject({
      reason: 'تجربة المصمم',
      isEnabled: true,
      planKeys: ['pro'],
      promptModelId: 'text1',
      imageModelId: 'img1',
      checkModelId: 'vis1',
      variants: 2,
      marginOverridePct: '45',
    });
  });
});
