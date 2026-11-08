import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CircleAlert, Clock, Ticket } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { isApiError } from '~/api/errors';
import {
  meBalanceActivityQueryKey,
  meBalanceBalanceQueryKey,
  meGetQueryKey,
  meSubscriptionGetQueryKey,
  meVouchersRedeemMutation,
  publicPlansListQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';
import type { RedeemResultDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RequestBalanceDialog } from '~/components/RequestBalanceDialog';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useSecondsUntil } from '~/features/chat';
import { formatDate } from '~/lib/dates';

const MAX_CODE_LENGTH = 40;

// Codes shown under the field; the code stays in the field for all of them.
const FIELD_ERRORS = new Set([
  'VOUCHER_NOT_FOUND',
  'VOUCHER_EXPIRED',
  'VOUCHER_USED_UP',
  'VOUCHER_ALREADY_REDEEMED',
  'VOUCHER_NOT_ELIGIBLE',
]);

function retrySeconds(data: Record<string, unknown> | undefined): number {
  const value = data?.retryAfterSeconds;
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(1, Math.ceil(value))
    : 60;
}

function SuccessMessage({ result }: { result: RedeemResultDto }) {
  const { t, i18n } = useTranslation();
  if (result.kind === 'trial' && result.plan) {
    const plan =
      i18n.language === 'en' ? result.plan.nameEn : result.plan.nameAr;
    return (
      <>
        {t('balance.redeem.trialActivated', {
          plan,
          date: formatDate(result.plan.currentPeriodEnd, i18n.language),
        })}
      </>
    );
  }
  return (
    <Trans
      i18nKey="balance.redeem.balanceAdded"
      components={{ money: <Money value={result.creditedUsd} signed /> }}
    />
  );
}

/**
 * «لديك كود؟»: redeem a balance or trial code (F10 §2). Collapsed by default.
 * `showPlansLink` is false on /plans, where «عرض الباقات» would be this page.
 */
export function RedeemCodeBox({
  showPlansLink = true,
}: {
  showPlansLink?: boolean;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fieldId = useId();
  const messageId = `${fieldId}-message`;
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [emptyError, setEmptyError] = useState(false);
  const [contact, setContact] = useState(false);
  // Epoch ms when the rate limit ends; the API sends the remaining time again.
  const [waitUntil, setWaitUntil] = useState<number | null>(null);
  const waitSeconds = useSecondsUntil(waitUntil);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  // Focus follows the toggle only after the user opened or closed the box.
  const moveFocus = useRef(false);

  const redeem = useMutation({
    ...meVouchersRedeemMutation(),
    onSuccess: () => {
      setCode('');
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: meBalanceBalanceQueryKey() }),
        queryClient.invalidateQueries({ queryKey: meGetQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: meSubscriptionGetQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: meBalanceActivityQueryKey(),
        }),
        queryClient.invalidateQueries({ queryKey: publicPlansListQueryKey() }),
      ]);
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'RATE_LIMITED') {
        setWaitUntil(Date.now() + retrySeconds(error.data) * 1000);
      }
    },
  });

  const limited = waitSeconds > 0;

  // When the countdown ends the RATE_LIMITED error is stale: clear it so the hint returns.
  const { reset: resetRedeem } = redeem;
  const rateLimitedNow =
    redeem.isError &&
    isApiError(redeem.error) &&
    redeem.error.code === 'RATE_LIMITED';
  useEffect(() => {
    if (waitUntil !== null && !limited && Date.now() >= waitUntil) {
      setWaitUntil(null);
      if (rateLimitedNow) resetRedeem();
    }
  }, [waitUntil, limited, rateLimitedNow, resetRedeem]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (open ? fieldRef.current : toggleRef.current)?.focus();
  }, [open]);

  const result = redeem.isSuccess ? redeem.data : null;
  const error = redeem.isError ? redeem.error : null;
  const errorCode = isApiError(error) ? error.code : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    // A second submit while the first runs would only answer ALREADY_REDEEMED.
    if (redeem.isPending || limited) return;
    if (code.trim() === '') {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    redeem.mutate({ body: { code } });
  };

  const close = () => {
    // A pending request would lose its answer: stay open until it settles.
    if (redeem.isPending) return;
    moveFocus.current = true;
    setOpen(false);
    setEmptyError(false);
    redeem.reset();
  };

  if (!open) {
    return (
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          ref={toggleRef}
          aria-expanded={false}
          onClick={() => {
            moveFocus.current = true;
            setOpen(true);
          }}
        >
          <Ticket aria-hidden="true" />
          {t('balance.redeem.open')}
        </Button>
      </div>
    );
  }

  const fieldError = emptyError
    ? t('balance.redeem.empty')
    : errorCode && FIELD_ERRORS.has(errorCode)
      ? t(`errors:${errorCode}`)
      : null;
  const needsPlan = errorCode === 'NO_ACTIVE_SUBSCRIPTION';
  const otherError =
    error && !fieldError && !needsPlan && errorCode !== 'RATE_LIMITED'
      ? isApiError(error)
        ? t(`errors:${error.code}`, {
            defaultValue: t('common.unexpectedError'),
          })
        : // A rejected fetch (offline, DNS, CORS) is the only non-API failure here.
          t('common.networkError')
      : null;

  return (
    <section
      aria-labelledby={`${fieldId}-title`}
      className="bg-surface border-border-subtle grid gap-4 rounded-lg border p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={`${fieldId}-title`}
          className="text-fg flex items-center gap-2 text-lg font-semibold"
        >
          <Ticket aria-hidden="true" className="text-fg-muted size-5" />
          {t('balance.redeem.title')}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={redeem.isPending}
          onClick={close}
        >
          {t('balance.redeem.close')}
        </Button>
      </div>

      {result ? (
        <Alert
          variant="success"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => redeem.reset()}
            >
              {t('balance.redeem.another')}
            </Button>
          }
        >
          <SuccessMessage result={result} />
        </Alert>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-3">
          <Label htmlFor={fieldId}>{t('balance.redeem.label')}</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id={fieldId}
              ref={fieldRef}
              dir="ltr"
              value={code}
              maxLength={MAX_CODE_LENGTH}
              placeholder={t('balance.redeem.placeholder')}
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              readOnly={redeem.isPending}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={messageId}
              onChange={(event) => {
                // Codes are Latin letters and digits: show them upper case.
                setCode(event.target.value.toUpperCase());
                setEmptyError(false);
                if (redeem.isError) redeem.reset();
              }}
              className="sm:flex-1"
            />
            <Button
              type="submit"
              loading={redeem.isPending}
              disabled={limited}
              className="w-full sm:w-auto"
            >
              {redeem.isPending
                ? t('balance.redeem.verifying')
                : t('balance.redeem.submit')}
            </Button>
          </div>
          <div id={messageId} className="grid gap-3">
            {fieldError ? (
              <p
                role="alert"
                className="text-danger flex items-start gap-2 text-sm leading-6"
              >
                <CircleAlert
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                {fieldError}
              </p>
            ) : null}
            {limited ? (
              <p
                role="status"
                className="text-fg-muted flex items-start gap-2 text-sm leading-6"
              >
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span className="grid gap-1">
                  <span>{t('balance.redeem.rateLimited')}</span>
                  <span>
                    {t('balance.redeem.wait', { count: waitSeconds })}
                  </span>
                </span>
              </p>
            ) : null}
            {!fieldError && !limited && !error ? (
              <p className="text-fg-muted text-sm">
                {t('balance.redeem.hint')}
              </p>
            ) : null}
            {otherError ? (
              <Alert
                variant="danger"
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => redeem.mutate({ body: { code } })}
                    disabled={redeem.isPending || code.trim() === ''}
                  >
                    {t('common.retry')}
                  </Button>
                }
              >
                {otherError}
              </Alert>
            ) : null}
            {needsPlan ? (
              <Alert
                variant="warning"
                action={
                  <div className="flex flex-wrap gap-3">
                    {showPlansLink ? (
                      <Button asChild size="sm">
                        <Link to="/plans">{t('balance.redeem.viewPlans')}</Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setContact(true)}
                    >
                      {t('balance.request')}
                    </Button>
                  </div>
                }
              >
                <span className="grid gap-1">
                  <span>{t('errors:NO_ACTIVE_SUBSCRIPTION')}</span>
                  <span>{t('balance.redeem.needsPlanExtra')}</span>
                </span>
              </Alert>
            ) : null}
          </div>
        </form>
      )}
      <RequestBalanceDialog open={contact} onOpenChange={setContact} />
    </section>
  );
}
