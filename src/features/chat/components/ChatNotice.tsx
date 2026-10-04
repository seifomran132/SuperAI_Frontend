import type { ReactNode } from 'react';
import { Clock, MessageCircle, Repeat } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Money } from '~/components/Money';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import type { ModeDto } from '~/api/generated/types.gen';
import type { Refusal } from '../model/refusals';
import { useModeLabel } from './mode';

/** Refusals that show under the composer, next to the text that caused them. */
export const isFieldRefusal = (refusal: Refusal | undefined) =>
  refusal?.code === 'CONTEXT_TOO_LONG' || refusal?.code === 'VALIDATION_FAILED';

export interface NoticeProps {
  refusal: Refusal;
  modes: ModeDto[];
  /** The mode the draft was sent with (its label is named in the balance notice). */
  selectedModeKey: string | null;
  onSwitchMode: (modeKey: string) => void;
  onRequestBalance: () => void;
  onRetry: () => void;
  rateLimitSeconds: number;
}

/** Amber/red notice above the composer. The draft is always kept. */
export function ChatNotice({
  tone = 'warning',
  action,
  children,
}: {
  tone?: 'warning' | 'danger';
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Alert variant={tone} action={action} data-slot="chat-notice">
      {children}
    </Alert>
  );
}

function ContactButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button type="button" size="sm" onClick={onClick}>
      <MessageCircle aria-hidden="true" className="size-4" />
      {label}
    </Button>
  );
}

/** The notice for a refusal, or nothing for the ones shown elsewhere. */
export function RefusalNotice({
  refusal,
  modes,
  selectedModeKey,
  onSwitchMode,
  onRequestBalance,
  onRetry,
  rateLimitSeconds,
}: NoticeProps) {
  const { t, i18n } = useTranslation();
  const modeLabel = useModeLabel();
  const labelOf = (key: string | null) => {
    const mode = modes.find((m) => m.key === key);
    return mode ? modeLabel(mode) : '';
  };

  switch (refusal.code) {
    case 'INSUFFICIENT_BALANCE': {
      // The mode the message was refused in (falls back to the current one),
      // and no button for a mode that is already selected.
      const requestedModeKey = refusal.modeKey ?? selectedModeKey;
      const alternatives = refusal.alternatives.filter(
        (a) =>
          a.modeKey !== selectedModeKey &&
          modes.some((m) => m.key === a.modeKey),
      );
      return (
        <ChatNotice
          action={
            alternatives.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {alternatives.map((alt) => (
                  <Button
                    key={alt.modeKey}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onSwitchMode(alt.modeKey)}
                  >
                    <Repeat aria-hidden="true" className="size-4" />
                    <Trans
                      i18nKey="chat.notice.switchTo"
                      values={{ mode: labelOf(alt.modeKey) }}
                      components={{
                        estimate: (
                          <Money value={alt.estimatedCostUsd} kind="cost" />
                        ),
                      }}
                    />
                  </Button>
                ))}
              </div>
            ) : (
              <ContactButton
                onClick={onRequestBalance}
                label={t('chat.notice.requestBalance')}
              />
            )
          }
        >
          {refusal.estimatedCostUsd !== null && refusal.balanceUsd !== null ? (
            <Trans
              i18nKey="chat.notice.insufficient"
              values={{ mode: labelOf(requestedModeKey) }}
              components={{
                estimate: (
                  <Money value={refusal.estimatedCostUsd} kind="cost" />
                ),
                balance: <Money value={refusal.balanceUsd} />,
              }}
            />
          ) : (
            t('errors:INSUFFICIENT_BALANCE')
          )}
        </ChatNotice>
      );
    }
    case 'NO_ACTIVE_SUBSCRIPTION':
      return <NoPlanNotice onRequestBalance={onRequestBalance} />;
    case 'CONVERSATION_BUSY':
      return <ChatNotice>{t('chat.notice.busy')}</ChatNotice>;
    case 'RATE_LIMITED':
      return (
        <ChatNotice>
          {/* Announced once, with the full wait; the live number is hidden from
              screen readers so it does not speak every second. */}
          <span className="sr-only">
            {t('chat.notice.rateLimitedStatic', {
              seconds: refusal.retryAfterSeconds,
            })}
          </span>
          <span aria-hidden="true" className="flex items-center gap-3">
            <span>
              {t('chat.notice.rateLimited', { seconds: rateLimitSeconds })}
            </span>
            <span className="bg-surface text-warning border-warning-border inline-flex h-7 min-w-9 items-center justify-center gap-1 rounded-full border px-2 text-xs tabular-nums">
              <Clock aria-hidden="true" className="size-3.5" />
              {rateLimitSeconds}
            </span>
          </span>
        </ChatNotice>
      );
    case 'MODE_NOT_AVAILABLE':
      return <ChatNotice>{t('errors:MODE_NOT_AVAILABLE')}</ChatNotice>;
    case 'NETWORK':
      return (
        <ChatNotice
          tone="danger"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRetry}
            >
              {t('common.retry')}
            </Button>
          }
        >
          {t('common.networkError')}
        </ChatNotice>
      );
    case 'OTHER': {
      const key = `errors:${refusal.errorCode}`;
      return (
        <ChatNotice tone="danger">
          {refusal.errorCode && i18n.exists(key)
            ? t(key)
            : t('common.unexpectedError')}
        </ChatNotice>
      );
    }
    case 'PROFILE_INCOMPLETE':
    case 'CONVERSATION_NOT_FOUND':
      return (
        <ChatNotice tone="danger">{t(`errors:${refusal.code}`)}</ChatNotice>
      );
    case 'CONTEXT_TOO_LONG':
    case 'VALIDATION_FAILED':
      return null;
  }
}

/** «ليست لديك باقة نشطة…» with the contact button; also shown up front when there is no plan. */
export function NoPlanNotice({
  onRequestBalance,
}: {
  onRequestBalance: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ChatNotice
      action={
        <ContactButton
          onClick={onRequestBalance}
          label={t('chat.notice.contactUs')}
        />
      }
    >
      {t('errors:NO_ACTIVE_SUBSCRIPTION')}
    </ChatNotice>
  );
}

/** Error text under the composer for a too-long or invalid message. */
export function FieldRefusalText({ refusal }: { refusal: Refusal }) {
  const { t } = useTranslation();
  if (!isFieldRefusal(refusal)) return null;
  return (
    <p id="composer-error" role="alert" className="text-danger text-sm">
      {t(`errors:${refusal.code}`)}
    </p>
  );
}
