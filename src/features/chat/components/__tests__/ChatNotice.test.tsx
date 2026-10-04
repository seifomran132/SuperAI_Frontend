import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import { modeFast, modeProfessional } from '~/mocks/chat';
import type { Refusal } from '../../model/refusals';
import {
  FieldRefusalText,
  RefusalNotice,
  isFieldRefusal,
  type NoticeProps,
} from '../ChatNotice';

const modes = [modeFast, modeProfessional];

function renderNotice(refusal: Refusal, props: Partial<NoticeProps> = {}) {
  const handlers = {
    onSwitchMode: vi.fn(),
    onRequestBalance: vi.fn(),
    onRetry: vi.fn(),
  };
  render(
    <RefusalNotice
      refusal={refusal}
      modes={modes}
      selectedModeKey="professional"
      rateLimitSeconds={30}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe('refusal notices', () => {
  it('insufficient balance: amounts and one switch button per alternative; switching only selects', () => {
    const { onSwitchMode, onRequestBalance } = renderNotice({
      code: 'INSUFFICIENT_BALANCE',
      modeKey: 'professional',
      estimatedCostUsd: '0.012000000',
      balanceUsd: '0.004000000',
      alternatives: [{ modeKey: 'fast', estimatedCostUsd: '0.003000000' }],
    });
    const notice = screen.getByRole('alert');
    expect(notice).toHaveTextContent('0.0120$');
    expect(notice).toHaveTextContent('0.0040$');
    const button = screen.getByRole('button', {
      name: /التبديل إلى «سريع»/,
    });
    expect(button).toHaveTextContent('0.0030$');
    fireEvent.click(button);
    expect(onSwitchMode).toHaveBeenCalledWith('fast');
    expect(onRequestBalance).not.toHaveBeenCalled();
  });

  it('insufficient balance without alternatives offers the contact dialog', () => {
    const { onRequestBalance } = renderNotice({
      code: 'INSUFFICIENT_BALANCE',
      modeKey: 'professional',
      estimatedCostUsd: null,
      balanceUsd: null,
      alternatives: [],
    });
    expect(screen.getByText(errorsAr.INSUFFICIENT_BALANCE)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: ar.chat.notice.requestBalance }),
    );
    expect(onRequestBalance).toHaveBeenCalled();
  });

  it('no plan: catalog text and the contact button', () => {
    const { onRequestBalance } = renderNotice({
      code: 'NO_ACTIVE_SUBSCRIPTION',
    });
    expect(
      screen.getByText(errorsAr.NO_ACTIVE_SUBSCRIPTION),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: ar.chat.notice.contactUs }),
    );
    expect(onRequestBalance).toHaveBeenCalled();
  });

  it('names the requested mode and hides the alternative that is already selected', () => {
    renderNotice(
      {
        code: 'INSUFFICIENT_BALANCE',
        modeKey: 'professional',
        estimatedCostUsd: '0.012000000',
        balanceUsd: '0.004000000',
        alternatives: [{ modeKey: 'fast', estimatedCostUsd: '0.003000000' }],
      },
      { selectedModeKey: 'fast' },
    );
    expect(
      screen.queryByRole('button', { name: /التبديل إلى/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ar.chat.notice.requestBalance }),
    ).toBeInTheDocument();
  });

  it('busy', () => {
    renderNotice({ code: 'CONVERSATION_BUSY' });
    expect(screen.getByText(ar.chat.notice.busy)).toBeInTheDocument();
  });

  it('rate limit shows the live seconds', () => {
    renderNotice(
      { code: 'RATE_LIMITED', retryAfterSeconds: 42, retryAt: 0 },
      { rateLimitSeconds: 17 },
    );
    expect(
      screen.getByText('أرسلت رسائل كثيرة خلال وقت قصير. حاول بعد 17 ثانية.'),
    ).toBeInTheDocument();
  });

  it('mode not available uses the catalog text', () => {
    renderNotice({ code: 'MODE_NOT_AVAILABLE' });
    expect(screen.getByText(errorsAr.MODE_NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('network failure offers retry', () => {
    const { onRetry } = renderNotice({
      code: 'NETWORK',
      retry: { content: 'x', modeKey: 'fast', clientRequestId: 'id' },
    });
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('too long and validation are not notices; they show under the composer', () => {
    const tooLong: Refusal = { code: 'CONTEXT_TOO_LONG' };
    expect(isFieldRefusal(tooLong)).toBe(true);
    const { container } = render(
      <RefusalNotice
        refusal={tooLong}
        modes={modes}
        selectedModeKey="fast"
        rateLimitSeconds={0}
        onSwitchMode={vi.fn()}
        onRequestBalance={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    render(<FieldRefusalText refusal={tooLong} />);
    expect(screen.getByText(errorsAr.CONTEXT_TOO_LONG)).toBeInTheDocument();
  });
});
