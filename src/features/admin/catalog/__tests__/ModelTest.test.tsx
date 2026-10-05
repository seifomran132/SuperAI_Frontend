import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, click, reasonField, useCatalogSession } from './harness';

useCatalogSession();

describe('ModelTest', () => {
  it('asks for confirmation as a paid request, then shows the reply, cost and timing', async () => {
    await renderApp('/admin/models/m1');
    fireEvent.click(
      await screen.findByRole('button', { name: a.models.test.open }),
    );

    // The warning is on screen and nothing has been sent yet.
    expect(screen.getByText(a.models.test.paidWarning)).toBeInTheDocument();
    expect(adminCalls('models:test')).toHaveLength(0);

    fireEvent.change(reasonField(), { target: { value: 'فحص المفتاح' } });
    click(a.models.test.confirmSubmit);

    const reply = await screen.findByText('مرحبًا بك');
    expect(reply).toHaveAttribute('dir', 'auto');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('stop')).toBeInTheDocument();
    expect(screen.getByText('420 ms')).toBeInTheDocument();
    expect(screen.getByText('1,300 ms')).toBeInTheDocument();
    // Provider cost and customer charge, both through Money.
    expect(
      screen.getByText('0.000092$', { selector: 'bdi' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('0.00012$', { selector: 'bdi' }),
    ).toBeInTheDocument();
    expect(adminCalls('models:test')[0]?.body).toMatchObject({
      reason: 'فحص المفتاح',
      maxOutputTokens: 64,
    });
  });
});
