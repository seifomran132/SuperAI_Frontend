import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';

export const textareaClass =
  'bg-surface text-fg placeholder:text-fg-subtle border-border-control min-h-24 w-full resize-y rounded-md border px-4 py-3 text-base outline-hidden focus-visible:border-focus focus-visible:outline-focus focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-danger aria-invalid:border-2';

/** Label, control, hint and field error (error replaces nothing: both can show). */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-fg text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-danger ms-1">
            *
          </span>
        ) : null}
        {required ? (
          <span className="sr-only"> {t('admin.dialog.required')}</span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-fg-muted text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className={cn('text-danger flex items-center gap-1.5 text-sm')}
        >
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** `aria-describedby` for a Field's hint and error. */
export const describedBy = (id: string, hint: boolean, error: boolean) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined;
