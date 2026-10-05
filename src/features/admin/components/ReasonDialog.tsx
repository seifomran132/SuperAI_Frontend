import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { reasonError } from '../model/validation';
import { Field, describedBy, textareaClass } from './Field';

/** Field name → i18n key under `admin.` (empty object = nothing to show). */
export type FieldErrors = Record<string, string>;

export interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  userName: string;
  submitLabel: string;
  /** Destructive confirmation (red button). */
  danger?: boolean;
  /** Warning shown above the fields (e.g. all balance expires). */
  notice?: ReactNode;
  /** Extra fields above the reason. */
  fields?: (ctx: {
    errors: FieldErrors;
    clearError: (field: string) => void;
  }) => ReactNode;
  /** Names of the extra fields shown, to match API field errors. */
  fieldNames?: string[];
  /** Checks the extra fields before sending; returns their errors. */
  validate?: () => FieldErrors;
  /** Sends the write. Throw the API error to show it inside the dialog. */
  onSubmit: (input: {
    reason: string;
    idempotencyKey: string;
  }) => Promise<void>;
}

/**
 * Confirmation with a required reason for every admin write. The idempotency
 * key is made when the dialog opens (the body mounts) and kept while it stays
 * open, so a retry after a failure repeats the same action, not a new one.
 */
export function ReasonDialog(props: ReasonDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-50" />
        <Dialog.Content className="bg-surface fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[480px] flex-col gap-4 overflow-y-auto rounded-xl p-6 shadow-lg outline-hidden">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-fg text-xl leading-8 font-bold">
              {props.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('admin.dialog.close')}
                className="-mt-2 -me-2"
              >
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-fg-muted -mt-2 text-sm">
            {t('admin.dialog.user', { name: props.userName })}
          </Dialog.Description>
          <ReasonForm {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReasonForm({
  onOpenChange,
  submitLabel,
  danger,
  notice,
  fields,
  fieldNames,
  validate,
  onSubmit,
}: ReasonDialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiErrorKey, setApiErrorKey] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const clearError = (field: string) =>
    setErrors((current) => {
      if (!(field in current)) return current;
      const rest = { ...current };
      delete rest[field];
      return rest;
    });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const found: FieldErrors = { ...validate?.() };
    const reasonProblem = reasonError(reason);
    if (reasonProblem) found.reason = reasonProblem;
    setErrors(found);
    setApiErrorKey(null);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    try {
      await onSubmit({ reason: reason.trim(), idempotencyKey });
      onOpenChange(false);
    } catch (error) {
      const details = isApiError(error) ? (error.details ?? []) : [];
      // Only details that match a field shown here become field errors.
      const known = new Set(['reason', ...(fieldNames ?? [])]);
      const matched = details.filter((d) => known.has(d.field));
      if (
        isApiError(error) &&
        error.code === 'VALIDATION_FAILED' &&
        matched.length > 0
      ) {
        // Field errors from `details`; the text is ours, never the API's.
        setErrors(
          Object.fromEntries(
            matched.map((d) => [d.field, 'dialog.fieldInvalid']),
          ),
        );
      } else if (isApiError(error) && error.code === 'IDEMPOTENCY_KEY_REUSED') {
        // The key was used for a different action: retry with a fresh one.
        setIdempotencyKey(crypto.randomUUID());
        setApiErrorKey('admin.dialog.keyReused');
      } else {
        setApiErrorKey(errorMessageKey(error));
      }
    } finally {
      setPending(false);
    }
  }

  const reasonId = `${id}-reason`;
  const reasonText = errors.reason ? t(`admin.${errors.reason}`) : undefined;
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {notice}
      {fields?.({ errors, clearError })}
      <Field
        id={reasonId}
        label={t('admin.dialog.reason')}
        required
        hint={t('admin.dialog.reasonHint')}
        error={reasonText}
      >
        <textarea
          id={reasonId}
          value={reason}
          maxLength={600}
          aria-invalid={reasonText ? true : undefined}
          aria-describedby={describedBy(reasonId, true, Boolean(reasonText))}
          onChange={(event) => {
            setReason(event.target.value);
            clearError('reason');
          }}
          className={textareaClass}
        />
      </Field>
      {apiErrorKey ? (
        <Alert variant="danger">
          <strong className="block">{t('admin.dialog.failed')}</strong>
          {t(apiErrorKey)}
        </Alert>
      ) : null}
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
        >
          {t('admin.common.cancel')}
        </Button>
        <Button
          type="submit"
          variant={danger ? 'danger' : 'primary'}
          loading={pending}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
