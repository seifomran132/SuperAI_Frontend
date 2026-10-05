import { useId, type ComponentProps, type ReactNode } from 'react';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { Field, describedBy, textareaClass } from './Field';

export const selectClass =
  'bg-surface text-fg border-border-control focus-visible:outline-focus h-12 w-full rounded-md border px-3 text-base outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:bg-surface-muted disabled:cursor-not-allowed aria-invalid:border-danger aria-invalid:border-2';

interface Common {
  label: string;
  hint?: string;
  /** Already translated. */
  error?: string;
  required?: boolean;
}

/** Label + 48px input + hint/error, with the ids wired for assistive tech. */
export function TextField({
  label,
  hint,
  error,
  required,
  onChange,
  className,
  ...input
}: Common &
  Omit<ComponentProps<typeof Input>, 'onChange' | 'id'> & {
    onChange: (value: string) => void;
  }) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(hint), Boolean(error))}
        onChange={(event) => onChange(event.target.value)}
        className={cn(input.dir === 'ltr' && 'text-start', className)}
        {...input}
      />
    </Field>
  );
}

/** Multi-line field; `counter` shows «n / max». */
export function TextAreaField({
  label,
  hint,
  error,
  required,
  onChange,
  counter,
  className,
  ...area
}: Common &
  Omit<ComponentProps<'textarea'>, 'onChange' | 'id' | 'value'> & {
    value: string;
    onChange: (value: string) => void;
    counter?: string;
  }) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        dir="auto"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(hint), Boolean(error))}
        onChange={(event) => onChange(event.target.value)}
        className={cn(textareaClass, className)}
        {...area}
      />
      {counter ? (
        <p className="text-fg-muted text-sm tabular-nums">{counter}</p>
      ) : null}
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  onChange,
  children,
  ...select
}: Common &
  Omit<ComponentProps<'select'>, 'onChange' | 'id'> & {
    onChange: (value: string) => void;
    children: ReactNode;
  }) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(hint), Boolean(error))}
        onChange={(event) => onChange(event.target.value)}
        className={selectClass}
        {...select}
      >
        {children}
      </select>
    </Field>
  );
}

/** Checkbox with a 44px row; `description` explains what it does. */
export function CheckField({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-start gap-3"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? `${id}-d` : undefined}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-brand focus-visible:outline-focus mt-3 size-5 shrink-0 outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <span className="grid py-2.5">
        <span className="text-fg text-base">{label}</span>
        {description ? (
          <span id={`${id}-d`} className="text-fg-muted text-sm">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

/** Table cell classes shared by the catalog tables. */
export const th = 'text-fg-muted px-4 py-3 text-start text-sm font-medium';
export const td = 'px-4 py-3 text-sm align-middle';
