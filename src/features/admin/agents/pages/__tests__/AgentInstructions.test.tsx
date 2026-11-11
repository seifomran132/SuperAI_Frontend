import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { adminAgent, agentMock } from '~/mocks/agents';
import { renderApp } from '~/test/render-app';
import {
  a as text,
  reasonField,
  useCatalogSession,
} from '../../../catalog/__tests__/harness';

// One dialog per file (see the catalog harness).
useCatalogSession();

const g = text.agents;

it('marks custom instructions in the list and restores the default as null', async () => {
  agentMock.admin = [
    adminAgent({
      promptInstructions: 'اكتب وصفًا قصيرًا',
      checkInstructions: null,
    }),
  ];
  await renderApp('/admin/agents');
  const row = (await screen.findByText('مصمم جرافيك')).closest('tr')!;
  expect(within(row).getByText(g.custom)).toBeInTheDocument();
  fireEvent.click(
    within(row).getByRole('button', {
      name: g.editLabel.replace('{{name}}', 'مصمم جرافيك'),
    }),
  );
  const dialog = await screen.findByRole('dialog');
  // Open because an instruction is custom.
  const prompt = within(dialog).getByLabelText(
    new RegExp(g.promptInstructions),
  );
  expect(prompt).toHaveValue('اكتب وصفًا قصيرًا');
  expect(within(dialog).getByText(g.checkWarning)).toBeInTheDocument();
  fireEvent.click(
    within(dialog).getByRole('button', { name: g.restoreDefault }),
  );
  expect(prompt).toHaveValue('');
  fireEvent.change(reasonField(), { target: { value: 'تعليمات افتراضية' } });
  fireEvent.click(within(dialog).getByRole('button', { name: g.save }));
  await waitFor(() => expect(agentMock.adminCalls).toHaveLength(1));
  expect(agentMock.adminCalls[0]).toMatchObject({
    promptInstructions: null,
    checkInstructions: null,
  });
});
