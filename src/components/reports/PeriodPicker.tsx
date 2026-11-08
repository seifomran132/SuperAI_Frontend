import { useId, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  PERIOD_PRESETS,
  formatDay,
  maskDate,
  periodLength,
  type PeriodPreset,
  type PeriodSearch,
} from '~/lib/period';
import { cn } from '~/lib/utils';
import { customRangeSchema } from './customRange';

const DEFAULT_DAYS: PeriodPreset = 30;

export interface PeriodFieldError {
  field: string;
  errors: string[];
}

/**
 * Admin report period: presets (7 / 30 / 90 days) and a custom range. The page owns
 * the period (it lives in the URL): `onChange` receives the new search params, only
 * ever a valid one.
 */
export function PeriodPicker({
  value,
  onChange,
  effective,
  serverErrors,
  className,
}: {
  value: PeriodSearch;
  onChange: (period: PeriodSearch) => void;
  /** The period the report actually shows (the response's `from`/`to`), for the summary line. */
  effective?: { from: string; to: string };
  /** `details` of a VALIDATION_FAILED answer, shown on the matching field. */
  serverErrors?: PeriodFieldError[];
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const isCustom = value.from !== undefined && value.to !== undefined;
  const [open, setOpen] = useState(isCustom);
  const [from, setFrom] = useState(value.from ?? effective?.from ?? '');
  const [to, setTo] = useState(value.to ?? effective?.to ?? '');

  const parsed = customRangeSchema().safeParse({ from, to });
  const issue = parsed.success ? undefined : parsed.error.issues[0];
  const touched = from.length === 10 && to.length === 10;
  // Typing a half-finished date is not an error yet.
  const shownIssue = touched && issue ? issue : undefined;
  const messageFor = (field: 'from' | 'to') => {
    if (shownIssue?.path[0] === field) return t(shownIssue.message);
    const server = serverErrors?.find((e) => e.field === field);
    return server?.errors[0] ? t('reports.period.errors.invalid') : undefined;
  };
  const activeDays = isCustom ? undefined : (value.days ?? DEFAULT_DAYS);

  const field = (
    name: 'from' | 'to',
    text: string,
    set: (v: string) => void,
  ) => {
    const message = messageFor(name);
    return (
      <div className="grid gap-1">
        <label
          htmlFor={`${id}-${name}`}
          className="text-fg text-sm font-medium"
        >
          {t(`reports.period.${name}`)}
        </label>
        <Input
          id={`${id}-${name}`}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          placeholder={t('reports.period.datePlaceholder')}
          value={text}
          maxLength={10}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${id}-${name}-error` : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            set(maskDate(e.target.value))
          }
          className="text-start"
        />
        {message && (
          <p
            id={`${id}-${name}-error`}
            role="alert"
            className="text-danger text-sm"
          >
            {message}
          </p>
        )}
      </div>
    );
  };

  const chip = (selected: boolean) =>
    cn(
      'min-h-11 rounded-md border px-4 text-sm',
      selected
        ? 'border-brand bg-brand text-on-brand'
        : 'border-border-control text-fg bg-surface',
    );

  return (
    <div className={cn('grid gap-3', className)}>
      <div
        role="group"
        aria-label={t('reports.period.label')}
        className="flex flex-wrap gap-2"
      >
        {PERIOD_PRESETS.map((days) => (
          <button
            key={days}
            type="button"
            aria-pressed={activeDays === days}
            onClick={() => {
              setOpen(false);
              onChange({ days });
            }}
            className={chip(activeDays === days)}
          >
            {t(`reports.period.last${days}`)}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={isCustom || open}
          aria-expanded={open}
          onClick={() => {
            if (!open) {
              // useState only reads its initial value: refill from the current period.
              setFrom(value.from ?? effective?.from ?? '');
              setTo(value.to ?? effective?.to ?? '');
            }
            setOpen((v) => !v);
          }}
          className={chip(isCustom || open)}
        >
          {t('reports.period.custom')}
        </button>
      </div>

      {open && (
        <form
          noValidate
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
          onSubmit={(e) => {
            e.preventDefault();
            if (parsed.success) onChange({ from, to });
          }}
        >
          {field('from', from, setFrom)}
          {field('to', to, setTo)}
          <Button type="submit" disabled={!parsed.success} className="sm:mt-6">
            {t('reports.period.apply')}
          </Button>
        </form>
      )}

      {effective && (
        <p className="text-fg-muted text-sm">
          {shownIssue
            ? t('reports.period.lastValid', {
                from: formatDay(effective.from, i18n.language),
                to: formatDay(effective.to, i18n.language),
              })
            : t('reports.period.summary', {
                from: formatDay(effective.from, i18n.language),
                to: formatDay(effective.to, i18n.language),
                days: t('reports.period.days', {
                  count: periodLength(effective.from, effective.to),
                }),
              })}
        </p>
      )}
      <p className="text-fg-subtle text-sm">{t('reports.period.utcNote')}</p>
    </div>
  );
}
