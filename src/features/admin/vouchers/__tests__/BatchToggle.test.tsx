import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { reasonField, useVoucherSession, v } from './harness';

useVoucherSession();

describe('turning a batch off', () => {
  it('needs a reason and sends only isActive', async () => {
    await renderApp('/admin/vouchers/batches/b1');
    fireEvent.click(
      await screen.findByRole('button', { name: v.batches.deactivate }),
    );
    expect(
      await screen.findByText(v.batches.deactivateBody),
    ).toBeInTheDocument();
    fireEvent.change(reasonField(), { target: { value: 'تسرّب' } });
    fireEvent.click(
      screen.getAllByRole('button', { name: v.batches.deactivate }).at(-1)!,
    );
    await waitFor(() => expect(adminCalls('batch:update')).toHaveLength(1));
    expect(adminCalls('batch:update')[0]?.body).toEqual({
      reason: 'تسرّب',
      isActive: false,
    });
    expect(
      await screen.findByText(v.batches.inactiveBanner),
    ).toBeInTheDocument();
  });
});
