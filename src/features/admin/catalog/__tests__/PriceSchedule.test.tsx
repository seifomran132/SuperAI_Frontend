import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, reasonField, type, useCatalogSession } from './harness';

useCatalogSession();

describe('PriceSchedule', () => {
  it('schedules a price as decimal strings and shows a period conflict by code', async () => {
    await renderApp('/admin/models/m1');
    fireEvent.click(
      await screen.findByRole('button', { name: a.models.priceSchedule }),
    );

    type(a.models.inputPrice, '2.5');
    type(a.models.outputPrice, '10');
    fireEvent.change(reasonField(), { target: { value: 'تغيير التسعير' } });

    const submit = () =>
      fireEvent.click(
        screen.getByRole('button', { name: a.models.priceSubmit }),
      );
    adminMock.fail = { status: 409, code: 'PRICE_PERIOD_CONFLICT' };
    submit();
    expect(
      await screen.findByText(errors.PRICE_PERIOD_CONFLICT),
    ).toBeInTheDocument();

    adminMock.fail = null;
    submit();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    const call = adminCalls('models:set-price').at(-1)?.body;
    expect(call).toMatchObject({
      reason: 'تغيير التسعير',
      inputPerMtok: '2.5',
      outputPerMtok: '10',
      cachedInputPerMtok: null,
      cacheWritePerMtok: null,
    });
    expect(call).not.toHaveProperty('effectiveFrom');
  });
});
