import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { MessageDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  activeAgentMessage,
  agentUi,
  useAgentAnswer,
  type AgentValue,
} from '../../model/agent';
import {
  BrandPickerInput,
  ChoicesInput,
  ColorsInput,
  FieldsInput,
  NoneInput,
  SummaryInput,
  TextInput,
  UploadInput,
} from './AgentInputs';

/**
 * Stands where the composer is in an agent conversation (S25): the input for
 * the newest question only. Free text can't be sent to an agent conversation.
 */
export default function AgentDock({
  conversationId,
  messages,
  onRequestBalance,
}: {
  conversationId: string;
  /** Oldest first, as rendered. */
  messages: MessageDto[];
  onRequestBalance: () => void;
}) {
  const { t } = useTranslation();
  const answer = useAgentAnswer(conversationId);
  const active = activeAgentMessage(messages);
  const ui = active ? agentUi(active) : null;
  const failure = answer.failure;

  if (!active || !ui) return null;
  if (failure?.kind === 'notAvailable') {
    return (
      <Alert
        variant="warning"
        action={
          <Button asChild variant="secondary" size="sm">
            <Link to="/plans">{t('chat.agent.viewPlans')}</Link>
          </Button>
        }
      >
        {t('chat.agent.notAvailable')}
      </Alert>
    );
  }

  const send = (value: AgentValue) => void answer.send(ui.step, value);
  const error =
    failure?.kind === 'validation'
      ? t('errors:VALIDATION_FAILED')
      : failure?.kind === 'kitLimit'
        ? t('errors:BRAND_KIT_LIMIT_REACHED')
        : failure?.kind === 'other'
          ? t(`errors:${failure.error.code}`, {
              defaultValue: t('chat.agent.networkError'),
            })
          : null;
  const props = { busy: answer.busy, error, onAnswer: send };

  let input;
  switch (ui.type) {
    case 'text':
      input = <TextInput key={active.id} ui={ui} {...props} />;
      break;
    case 'choices':
      input = <ChoicesInput key={active.id} ui={ui} {...props} />;
      break;
    case 'upload':
      input = <UploadInput key={active.id} ui={ui} {...props} />;
      break;
    case 'colors':
      input = <ColorsInput key={active.id} ui={ui} {...props} />;
      break;
    case 'brand_picker':
      input = <BrandPickerInput key={active.id} ui={ui} {...props} />;
      break;
    case 'fields':
      input = <FieldsInput key={active.id} ui={ui} {...props} />;
      break;
    case 'summary':
      input = (
        <SummaryInput
          key={active.id}
          ui={ui}
          {...props}
          onRequestBalance={onRequestBalance}
        />
      );
      break;
    case 'none':
      input = <NoneInput />;
      break;
  }

  return (
    <div data-agent-dock className="flex flex-col gap-2">
      {answer.moved ? (
        <p role="status" className="text-fg-muted text-center text-sm">
          {t('chat.agent.moved')}
        </p>
      ) : null}
      {failure?.kind === 'network' ? (
        <Alert
          variant="danger"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={answer.retry}
            >
              {t('chat.agent.retry')}
            </Button>
          }
        >
          {t('chat.agent.networkError')}
        </Alert>
      ) : null}
      {input}
    </div>
  );
}
