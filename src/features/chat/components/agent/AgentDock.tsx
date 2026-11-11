import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { MessageDto } from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  activeAgentMessage,
  agentUi,
  type AgentRegion,
  type AgentValue,
  type useAgentAnswer,
} from '../../model/agent';
import { RegionInput } from './RegionInput';
import {
  BrandPickerInput,
  ChoicesInput,
  ColorsInput,
  Dock,
  FieldsInput,
  NoneInput,
  SummaryInput,
  TextInput,
  UploadInput,
} from './AgentInputs';

/**
 * Stands where the composer is in an agent conversation (S25, S27): the input
 * for the newest question only. Free text can't be sent to an agent
 * conversation. The answer state is the page's, shared with «تعديل» on results.
 */
export default function AgentDock({
  messages,
  answer,
  onRequestBalance,
}: {
  /** Oldest first, as rendered. */
  messages: MessageDto[];
  answer: ReturnType<typeof useAgentAnswer>;
  onRequestBalance: () => void;
}) {
  const { t, i18n } = useTranslation();
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
          balanceShort={
            failure?.kind === 'balance' ? failure.fitsVariants : undefined
          }
          onRequestBalance={onRequestBalance}
        />
      );
      break;
    case 'region':
      input = (
        <RegionInput
          key={active.id}
          ui={ui}
          {...props}
          other={markedLogo(messages)}
        />
      );
      break;
    case 'progress':
      // Designs are being made: nothing to answer; the page polls meanwhile.
      input = (
        <p className="text-fg-muted text-center text-sm">
          {t('chat.agent.leaveNote')}
        </p>
      );
      break;
    case 'results':
      input = (
        <Dock>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-fg-muted text-sm">
              {t('chat.agent.next')}
            </span>
            <div className="flex flex-wrap gap-2">
              {ui.options.map((option, index) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={index === 0 ? 'primary' : 'secondary'}
                  loading={answer.busy && index === 0}
                  disabled={answer.busy}
                  onClick={() => send({ action: option.value })}
                >
                  {i18n.language === 'en' ? option.labelEn : option.labelAr}
                </Button>
              ))}
            </div>
          </div>
          {error ? (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          ) : null}
        </Dock>
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
      {failure?.kind === 'notReady' ? (
        <Alert variant="warning">{t('chat.agent.notReady')}</Alert>
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

/** The logo box answered earlier in this edit, if any (shown on the product step). */
function markedLogo(messages: MessageDto[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const answer = messages[i]!.answer as {
      step?: string;
      value?: { region?: AgentRegion };
    } | null;
    if (answer?.step === 'edit_logo_region')
      return answer.value?.region ?? null;
    if (answer?.step === 'edit_upload') return null;
  }
  return null;
}
