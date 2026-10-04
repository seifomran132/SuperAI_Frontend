import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import { message, modeFast, modeProfessional } from '~/mocks/chat';
import {
  clearMessageCosts,
  recordMessageCost,
} from '../../model/message-costs';
import { AssistantMessage } from '../MessageCard';

const modes = [modeFast, modeProfessional];
afterEach(() => clearMessageCosts());

function card(overrides: Parameters<typeof message>[0]) {
  const m = message(overrides);
  render(<AssistantMessage message={m} modes={modes} local={false} />);
  return m;
}

describe('assistant card', () => {
  it('partial with an error code keeps the text and shows the catalog reason', () => {
    const m = card({
      sequence: 2,
      role: 'assistant',
      content: 'جزء من الرد',
      status: 'partial',
      finishReason: 'other',
      errorCode: 'PROVIDER_TIMEOUT',
    });
    recordMessageCost(m.id, '0.001000000');
    expect(screen.getByText('جزء من الرد')).toBeInTheDocument();
    expect(screen.getByText(errorsAr.PROVIDER_TIMEOUT)).toBeInTheDocument();
    expect(screen.queryByText(ar.chat.message.cut)).not.toBeInTheDocument();
  });

  it('stopped answer shows the cut note', () => {
    card({
      sequence: 2,
      role: 'assistant',
      content: 'نص',
      status: 'partial',
      finishReason: 'aborted',
    });
    expect(screen.getByText(ar.chat.message.cut)).toBeInTheDocument();
  });

  it('hides a zero cost and shows a real one with four decimals', () => {
    const zero = message({
      sequence: 2,
      role: 'assistant',
      content: 'نص',
      status: 'complete',
    });
    recordMessageCost(zero.id, '0.000000000');
    const { container } = render(
      <AssistantMessage message={zero} modes={modes} local={false} />,
    );
    expect(container.querySelector('footer')).not.toHaveTextContent('$');
  });
});
