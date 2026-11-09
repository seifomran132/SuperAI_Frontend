import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { batchesMock } from '~/mocks/admin-voucher-batches';
import { renderApp } from '~/test/render-app';
import { downloadBatchCsv } from '../model/batches';
import { useVoucherSession, v } from './harness';

useVoucherSession();

const b = v.batches;
const target = { id: 'b1', name: 'حملة/العيد' };

function stubDownload() {
  URL.createObjectURL = vi.fn(() => 'blob:csv');
  URL.revokeObjectURL = vi.fn();
  return vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);
}

// The dialog's buttons hang jsdom (see the catalog harness); the whole flow is
// covered in a real browser by tests/cases/voucher-batches.spec.ts.
describe('BatchDownload', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns first and does not fetch the file yet', async () => {
    await renderApp('/admin/vouchers/batches/b1');
    fireEvent.click(await screen.findByRole('button', { name: b.download }));
    expect(await screen.findByText(b.warningTitle)).toBeInTheDocument();
    expect(adminCalls('batch:export')).toHaveLength(0);
  });

  it('saves the file under a safe name', async () => {
    const clicked = stubDownload();
    let name = '';
    clicked.mockImplementation(function (this: HTMLAnchorElement) {
      name = this.download;
    });
    await downloadBatchCsv(target);
    expect(name).toBe('حملة-العيد.csv');
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('throws on failure and saves nothing', async () => {
    const clicked = stubDownload();
    batchesMock.failExport = true;
    await expect(downloadBatchCsv(target)).rejects.toBeDefined();
    expect(clicked).not.toHaveBeenCalled();
  });
});
