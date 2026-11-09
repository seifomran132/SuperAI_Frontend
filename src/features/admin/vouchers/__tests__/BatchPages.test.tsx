import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { batch, batchesMock } from '~/mocks/admin-voucher-batches';
import { vouchersMock, voucher } from '~/mocks/admin-vouchers';
import errors from '~/i18n/errors.ar.json';
import { renderApp } from '~/test/render-app';
import { useVoucherSession, v } from './harness';

useVoucherSession();

const b = v.batches;
const openDetail = async () => {
  await renderApp('/admin/vouchers/batches/b1');
  await screen.findByRole('heading', { name: 'حملة b1' });
};

describe('batches list', () => {
  it('shows the tab with progress and links to the batch', async () => {
    await renderApp('/admin/vouchers?tab=batches');
    const link = (await screen.findAllByRole('link', { name: 'حملة b1' }))[0]!;
    expect(link).toHaveAttribute('href', '/admin/vouchers/batches/b1');
    expect(screen.getAllByText('2 / 10')[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: b.tabBatches })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('explains an empty list', async () => {
    batchesMock.batches = [];
    await renderApp('/admin/vouchers?tab=batches');
    expect(await screen.findByText(b.emptyTitle)).toBeInTheDocument();
  });

  it('recovers from a load error', async () => {
    batchesMock.failReads = { status: 500, code: 'INTERNAL_ERROR' };
    await renderApp('/admin/vouchers?tab=batches');
    expect(await screen.findByText(b.error)).toBeInTheDocument();
  });
});

describe('batch detail', () => {
  it('shows progress, credited of total, and the codes', async () => {
    await openDetail();
    expect((await screen.findAllByText('EID-C1'))[0]).toBeInTheDocument();
    expect(screen.getByText('10.00$')).toBeInTheDocument();
    expect(screen.getByText('50.00$')).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'reader@example.com' })[0],
    ).toHaveAttribute('href', '/admin/users/user-1');
  });

  it('offers turn off, turn on, and nothing for a used code', async () => {
    await openDetail();
    await screen.findAllByText('EID-C1');
    const name = (label: string, code: string) => `${label} ${code}`;
    expect(
      screen.getAllByRole('button', { name: name(v.deactivate, 'EID-C1') })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: name(v.activate, 'EID-C3') })[0],
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: name(v.deactivate, 'EID-C2') }),
    ).toBeNull();
  });

  it('with the batch off: a banner and no per-code action', async () => {
    batchesMock.batches = [batch('b1', { isActive: false })];
    await openDetail();
    expect(screen.getByText(b.inactiveBanner)).toBeInTheDocument();
    await screen.findAllByText('EID-C1');
    expect(
      screen.queryByRole('button', { name: `${v.deactivate} EID-C1` }),
    ).toBeNull();
    expect(screen.getByRole('button', { name: b.download })).toBeEnabled();
  });

  it('asks the server for used codes when filtered', async () => {
    await openDetail();
    await screen.findAllByText('EID-C1');
    fireEvent.change(screen.getByRole('combobox', { name: b.codesFilter }), {
      target: { value: 'used' },
    });
    expect((await screen.findAllByText('EID-C2'))[0]).toBeInTheDocument();
    expect(screen.queryByText('EID-C1')).toBeNull();
  });

  it('shows the batch not found error by code', async () => {
    await renderApp('/admin/vouchers/batches/nope');
    expect(
      await screen.findByText(errors.VOUCHER_BATCH_NOT_FOUND),
    ).toBeInTheDocument();
  });
});

describe('a code from a batch on the single voucher page', () => {
  it('hides the limit and end date, keeps the note, and links the batch', async () => {
    vouchersMock.vouchers = [voucher('v1', { batchId: 'b1' })];
    await renderApp('/admin/vouchers/v1');
    await screen.findByRole('heading', { name: 'CODE-V1' });
    const notice = await screen.findByText(new RegExp(b.batchCodeBody));
    const link = within(notice.closest('[role]') ?? document.body).getByRole(
      'link',
      { name: b.openBatch },
    );
    expect(link).toHaveAttribute('href', '/admin/vouchers/batches/b1');
    expect(screen.queryByLabelText(new RegExp(v.maxRedemptions))).toBeNull();
    expect(screen.queryByLabelText(new RegExp(v.endsAt))).toBeNull();
    expect(screen.getByLabelText(new RegExp(v.note))).toBeInTheDocument();
  });
});
