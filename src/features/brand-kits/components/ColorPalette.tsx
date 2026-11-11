import { useId, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import '../i18n';
import { COLORS_MAX, normalizeHex } from '../model/rules';
import { Hex } from './parts';

type AddError = 'invalid' | 'duplicate' | 'full' | null;

/**
 * The palette, most important first (S24 colours section). Used on the kit page
 * and by the chat's colours step. Suggested colours are offered as chips and
 * never added on their own.
 */
export function ColorPalette({
  value,
  onChange,
  suggested = [],
  max = COLORS_MAX,
  disabled = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggested?: string[];
  max?: number;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const ids = useId();
  const [picked, setPicked] = useState('#1E293B');
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<AddError>(null);
  const full = value.length >= max;
  const offers = suggested
    .map((hex) => normalizeHex(hex))
    .filter((hex): hex is string => hex !== null && !value.includes(hex));

  const move = (index: number, by: -1 | 1) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item!);
    onChange(next);
  };

  const add = (raw: string) => {
    const hex = normalizeHex(raw);
    if (!hex) return setError('invalid');
    if (value.includes(hex)) return setError('duplicate');
    if (full) return setError('full');
    setError(null);
    setTyped('');
    onChange([...value, hex]);
  };

  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 ? (
        <p className="text-fg-muted text-sm">{t('brandKits.colors.empty')}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {value.map((hex, index) => (
            <li
              key={hex}
              className="border-border-subtle flex flex-wrap items-center gap-3 rounded-md border p-2 ps-3"
            >
              <span
                className="text-fg-muted w-5 text-sm tabular-nums"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span
                aria-hidden="true"
                className="border-border-subtle size-10 shrink-0 rounded-md border"
                style={{ backgroundColor: hex }}
              />
              <Hex value={hex} className="text-fg" />
              {index === 0 ? (
                <span className="bg-mode-2-container text-mode-2 border-mode-2-border inline-flex h-7 items-center rounded-full border px-2.5 text-[13px] font-medium">
                  {t('brandKits.colors.main')}
                </span>
              ) : null}
              <span className="ms-auto flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={disabled || index === 0}
                  aria-label={t('brandKits.colors.earlier', { hex })}
                  onClick={() => move(index, -1)}
                >
                  <ChevronUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={disabled || index === value.length - 1}
                  aria-label={t('brandKits.colors.later', { hex })}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDown aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={disabled}
                  aria-label={t('brandKits.colors.remove', { hex })}
                  className="text-danger hover:text-danger"
                  onClick={() => onChange(value.filter((c) => c !== hex))}
                >
                  <X aria-hidden="true" />
                </Button>
              </span>
            </li>
          ))}
        </ol>
      )}

      {offers.length > 0 ? (
        <div className="bg-mode-2-container border-mode-2-border flex flex-col gap-3 rounded-md border p-4">
          <p className="text-mode-2 text-sm font-semibold">
            {t('brandKits.colors.suggestedTitle')}
          </p>
          <ul className="flex flex-wrap gap-2">
            {offers.map((hex) => (
              <li
                key={hex}
                className="bg-surface border-border-control flex items-center gap-2 rounded-full border py-1 ps-1.5 pe-1"
              >
                <span
                  aria-hidden="true"
                  className="size-8 rounded-full"
                  style={{ backgroundColor: hex }}
                />
                <Hex value={hex} className="text-fg text-sm" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-11 rounded-full px-4"
                  disabled={disabled || full}
                  aria-label={t('brandKits.colors.addSuggestedLabel', { hex })}
                  onClick={() => add(hex)}
                >
                  {t('brandKits.colors.addSuggested')}
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-fg-muted text-sm">
            {t('brandKits.colors.suggestedNote')}
          </p>
        </div>
      ) : null}

      <form
        className="flex flex-wrap items-start gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add(typed || picked);
        }}
      >
        <label className="sr-only" htmlFor={`${ids}-picker`}>
          {t('brandKits.colors.picker')}
        </label>
        <input
          id={`${ids}-picker`}
          type="color"
          value={picked}
          disabled={disabled || full}
          onChange={(event) => {
            setPicked(event.target.value);
            setTyped(event.target.value.toUpperCase());
            setError(null);
          }}
          className="border-border-control focus-visible:outline-focus size-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid disabled:opacity-60"
        />
        <div className="flex min-w-40 flex-1 flex-col gap-1 sm:max-w-56 sm:flex-none">
          <label className="sr-only" htmlFor={`${ids}-hex`}>
            {t('brandKits.colors.hexLabel')}
          </label>
          <Input
            id={`${ids}-hex`}
            dir="ltr"
            value={typed}
            placeholder="#RRGGBB"
            maxLength={7}
            disabled={disabled || full}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${ids}-error` : undefined}
            onChange={(event) => {
              setTyped(event.target.value);
              setError(null);
            }}
            className="text-start"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          disabled={disabled || full}
          className={cn('h-12')}
        >
          <Plus aria-hidden="true" />
          {t('brandKits.colors.add')}
        </Button>
      </form>
      {error || full ? (
        <p
          id={`${ids}-error`}
          role={error ? 'alert' : undefined}
          className={cn('text-sm', error ? 'text-danger' : 'text-fg-muted')}
        >
          {t(`brandKits.colors.${error ?? 'full'}`)}
        </p>
      ) : null}
    </div>
  );
}
