import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addMonths, currentMonth, formatMonth, monthRange } from '~/lib/months';
import { cn } from '~/lib/utils';

const arrow =
  'border-border-control text-fg bg-surface grid size-11 shrink-0 place-content-center rounded-md border disabled:opacity-40';

/**
 * "My usage" month picker: previous / month button / next, from the account's first
 * month to the current one (no future months). `month` is UTC `YYYY-MM`.
 */
export function MonthPicker({
  month,
  firstMonth,
  onChange,
  now,
  className,
}: {
  month: string;
  /** The account's creation month; earlier months are not offered. */
  firstMonth: string;
  onChange: (month: string) => void;
  /** Test seam; defaults to the current time. */
  now?: Date;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const last = currentMonth(now);
  const first = firstMonth > last ? last : firstMonth;
  const months = monthRange(first, last);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onDown = (e: MouseEvent) =>
      root.current?.contains(e.target as Node) || setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  const choose = (next: string, refocus = false) => {
    setOpen(false);
    // The list unmounts, which would drop focus to the page.
    if (refocus) trigger.current?.focus();
    if (next !== month) onChange(next);
  };

  return (
    <div
      ref={root}
      role="group"
      aria-label={t('reports.month.label')}
      className={cn('relative flex items-center gap-2', className)}
    >
      {/* First in the DOM = right side in RTL, so "previous" sits on the right. */}
      <button
        type="button"
        aria-label={t('reports.month.previous')}
        disabled={month <= first}
        onClick={() => choose(addMonths(month, -1))}
        className={arrow}
      >
        <ChevronRight aria-hidden className="size-5 ltr:rotate-180" />
      </button>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${t('reports.month.choose')}: ${formatMonth(month, i18n.language)}`}
        onClick={() => setOpen((v) => !v)}
        className="border-border-control text-fg bg-surface flex min-h-11 min-w-44 items-center justify-between gap-2 rounded-md border px-4 font-medium"
      >
        <span>{formatMonth(month, i18n.language)}</span>
        <ChevronDown aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        aria-label={t('reports.month.next')}
        disabled={month >= last}
        onClick={() => choose(addMonths(month, 1))}
        className={arrow}
      >
        <ChevronLeft aria-hidden className="size-5 ltr:rotate-180" />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('reports.month.choose')}
          className="border-border bg-surface absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-md border p-1 shadow-md"
        >
          {months.map((m) => (
            <li key={m} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={m === month}
                onClick={() => choose(m, true)}
                className={cn(
                  'min-h-11 w-full rounded-sm px-3 text-start',
                  m === month
                    ? 'bg-surface-muted font-medium'
                    : 'hover:bg-surface-muted',
                )}
              >
                {formatMonth(m, i18n.language)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
