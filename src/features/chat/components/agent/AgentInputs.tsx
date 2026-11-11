import { useId, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BrandAssetDto } from '~/api/generated/types.gen';
import { TextLink } from '~/components/TextLink';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  AssetDropZone,
  AssetTile,
  ColorPalette,
  DraftBadge,
  KitThumbnail,
  PendingTile,
  useAssetUploads,
} from '~/features/brand-kits/ui';
import type { AssetKind } from '~/features/brand-kits';
import { cn } from '~/lib/utils';
import type { AgentUi, AgentValue } from '../../model/agent';

type Of<T extends AgentUi['type']> = Extract<AgentUi, { type: T }>;

export interface InputProps<T extends AgentUi['type']> {
  ui: Of<T>;
  busy: boolean;
  /** A refusal of the last answer (`400 VALIDATION_FAILED`), shown under the input. */
  error: string | null;
  onAnswer: (value: AgentValue) => void;
}

function Counter({ count, max }: { count: number; max: number }) {
  const { t } = useTranslation();
  return (
    <span
      dir="ltr"
      className={cn(
        'shrink-0 text-sm whitespace-nowrap tabular-nums',
        count > max ? 'text-danger font-semibold' : 'text-fg-muted',
      )}
    >
      {t('chat.agent.counter', { count, max })}
    </span>
  );
}

function FieldError({ id, error }: { id: string; error: string | null }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="text-danger text-sm">
      {error}
    </p>
  );
}

/** The panel that stands where the composer is. */
export function Dock({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border-border-control flex max-h-[60dvh] flex-col gap-3 overflow-y-auto rounded-xl border p-3 shadow-sm sm:p-4">
      {children}
    </div>
  );
}

function SendButton({ busy, disabled }: { busy: boolean; disabled?: boolean }) {
  const { t } = useTranslation();
  return (
    <Button
      type="submit"
      size="icon"
      loading={busy}
      disabled={disabled}
      aria-label={t('chat.agent.send')}
      className="rounded-full"
    >
      <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
    </Button>
  );
}

/** `text`: a composer-like box with a counter; «تخطّي» when optional. */
export function TextInput({ ui, busy, error, onAnswer }: InputProps<'text'>) {
  const { t } = useTranslation();
  const id = useId();
  const [text, setText] = useState('');
  const over = text.length > ui.maxLength;
  const empty = text.trim().length === 0;
  const submit = () => {
    if (!empty && !over) onAnswer({ text: text.trim() });
  };
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Dock>
        <label htmlFor={id} className="sr-only">
          {t('chat.agent.inputLabel')}
        </label>
        <textarea
          id={id}
          dir="auto"
          rows={2}
          value={text}
          autoFocus
          aria-invalid={over || Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          className="text-fg placeholder:text-fg-subtle min-h-12 w-full resize-none bg-transparent px-1 text-base leading-7 outline-hidden"
        />
        <FieldError id={`${id}-error`} error={error} />
        <div className="flex items-center justify-between gap-2">
          <Counter count={text.length} max={ui.maxLength} />
          <div className="flex items-center gap-2">
            {ui.optional ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => onAnswer({ text: '' })}
              >
                {t('chat.agent.skip')}
              </Button>
            ) : null}
            <SendButton busy={busy} disabled={empty || over} />
          </div>
        </div>
      </Dock>
    </form>
  );
}

/**
 * `choices`: chips; with `allowText` also a free-text box.
 */
export function ChoicesInput({
  ui,
  busy,
  error,
  onAnswer,
}: InputProps<'choices'>) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [text, setText] = useState('');
  const pick = (value: string) => onAnswer({ choice: value });
  const over = text.length > ui.maxLength;
  return (
    <Dock>
      <ul className="flex flex-wrap gap-2">
        {ui.options.map((option) => (
          <li key={option.value}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              className="rounded-full"
              onClick={() => pick(option.value)}
            >
              {i18n.language === 'en' ? option.labelEn : option.labelAr}
            </Button>
          </li>
        ))}
      </ul>
      {ui.allowText ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim() && !over) onAnswer({ text: text.trim() });
          }}
        >
          <label htmlFor={id} className="text-fg-muted text-sm">
            {t('chat.agent.orDescribe')}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id={id}
              dir="auto"
              value={text}
              aria-invalid={over || Boolean(error) || undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => setText(event.target.value)}
            />
            <SendButton busy={busy} disabled={!text.trim() || over} />
          </div>
          <Counter count={text.length} max={ui.maxLength} />
        </form>
      ) : null}
      <FieldError id={`${id}-error`} error={error} />
    </Dock>
  );
}

/** `upload`: files go to the step's kit first; the answer is their ids. */
export function UploadInput({
  ui,
  busy,
  error,
  onAnswer,
}: InputProps<'upload'>) {
  const { t } = useTranslation();
  const id = useId();
  const kinds = ui.kinds.filter((k): k is AssetKind =>
    ['logo', 'reference', 'product', 'guideline'].includes(k),
  );
  const [kind, setKind] = useState<AssetKind>(kinds[0] ?? 'reference');
  const [sent, setSent] = useState<BrandAssetDto[]>([]);
  const uploads = useAssetUploads({
    kitId: ui.brandKitId,
    onUploaded: (result) => setSent((list) => [...list, result.asset]),
  });
  const room = ui.maxFiles - sent.length - uploads.uploading;
  const waiting = uploads.uploading > 0;
  return (
    <Dock>
      {kinds.length > 1 ? (
        <div role="group" className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <Button
              key={k}
              type="button"
              size="sm"
              variant={k === kind ? 'primary' : 'secondary'}
              aria-pressed={k === kind}
              className="rounded-full"
              onClick={() => setKind(k)}
            >
              {t(`brandKits.assets.kinds.${k}.title`)}
            </Button>
          ))}
        </div>
      ) : null}
      <AssetDropZone
        kind={kind}
        disabled={busy || room <= 0}
        describedBy={room <= 0 ? `${id}-max` : undefined}
        onFiles={(files) => uploads.add(kind, files, room)}
      />
      {room <= 0 ? (
        <p id={`${id}-max`} className="text-fg-muted text-sm">
          {t('chat.agent.maxFiles', { count: ui.maxFiles })}
        </p>
      ) : null}
      {sent.length + uploads.items.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {uploads.items.map((item) => (
            <PendingTile
              key={item.id}
              item={item}
              onRetry={() => uploads.retry(item.id)}
              onDismiss={() => uploads.dismiss(item.id)}
            />
          ))}
          {sent.map((asset, index) => (
            <AssetTile
              key={asset.id}
              kitId={ui.brandKitId}
              asset={asset}
              label={t('brandKits.assets.removeLabel', {
                position: index + 1,
                group: t(`brandKits.assets.kinds.${asset.kind}.title`),
              })}
              // Leaves the file in the kit; it just isn't part of this answer.
              onDelete={() =>
                setSent((list) => list.filter((a) => a.id !== asset.id))
              }
            />
          ))}
        </ul>
      ) : null}
      <FieldError id={`${id}-error`} error={error} />
      {waiting ? (
        <p role="status" className="text-fg-muted text-sm">
          {t('chat.agent.uploadsPending')}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        {ui.optional ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy || waiting}
            onClick={() => onAnswer({ assetIds: [] })}
          >
            {t('chat.agent.skip')}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          loading={busy}
          disabled={waiting || sent.length === 0}
          onClick={() => onAnswer({ assetIds: sent.map((a) => a.id) })}
        >
          {t('chat.agent.send')}
        </Button>
      </div>
    </Dock>
  );
}

/** `colors`: the palette with the logo's colours offered; most important first. */
export function ColorsInput({
  ui,
  busy,
  error,
  onAnswer,
}: InputProps<'colors'>) {
  const { t } = useTranslation();
  const [colors, setColors] = useState(ui.current);
  return (
    <Dock>
      <ColorPalette
        value={colors}
        onChange={setColors}
        suggested={ui.suggested}
        max={ui.max}
        disabled={busy}
      />
      <FieldError id="agent-colors-error" error={error} />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          loading={busy}
          onClick={() => onAnswer({ colors })}
        >
          {t('chat.agent.send')}
        </Button>
      </div>
    </Dock>
  );
}

/** `brand_picker`: the user's kits as cards, and «علامة جديدة». */
export function BrandPickerInput({
  ui,
  busy,
  error,
  onAnswer,
}: InputProps<'brand_picker'>) {
  const { t } = useTranslation();
  const card =
    'bg-surface border-border-subtle hover:bg-surface-muted focus-visible:outline-focus flex min-h-16 w-full items-center gap-3 rounded-lg border p-3 text-start outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60';
  return (
    <Dock>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ui.kits.map((kit) => (
          <li key={kit.id}>
            <button
              type="button"
              disabled={busy}
              className={card}
              onClick={() => onAnswer({ brandKitId: kit.id })}
            >
              <KitThumbnail kit={{ ...kit, colors: [] }} className="size-11" />
              <span
                dir="auto"
                className="text-fg min-w-0 flex-1 truncate font-semibold"
              >
                {kit.name}
              </span>
              {kit.status === 'draft' ? <DraftBadge /> : null}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={busy || !ui.canCreate}
            aria-describedby={ui.canCreate ? undefined : 'agent-kit-limit'}
            className={cn(card, 'border-dashed')}
            onClick={() => onAnswer({ new: true })}
          >
            <span className="bg-surface-muted text-fg flex size-11 shrink-0 items-center justify-center rounded-md">
              <Plus aria-hidden="true" className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-fg font-semibold">
                {t('chat.agent.newBrand')}
              </span>
              <span className="text-fg-muted text-sm">
                {t('chat.agent.newBrandBody')}
              </span>
            </span>
          </button>
        </li>
      </ul>
      {ui.canCreate ? null : (
        <p id="agent-kit-limit" className="text-fg-muted text-sm">
          {t('chat.agent.limitReached')}{' '}
          <TextLink to="/plans">{t('chat.agent.viewPlans')}</TextLink>
        </p>
      )}
      <FieldError id="agent-picker-error" error={error} />
    </Dock>
  );
}

/** `fields`: headline and second line; both may be empty («بدون نص»). */
export function FieldsInput({
  ui,
  busy,
  error,
  onAnswer,
}: InputProps<'fields'>) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const over = ui.fields.some(
    (f) => (values[f.key] ?? '').length > f.maxLength,
  );
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (over) return;
        onAnswer(
          Object.fromEntries(
            ui.fields.map((f) => [f.key, (values[f.key] ?? '').trim()]),
          ),
        );
      }}
    >
      <Dock>
        {ui.fields.map((field) => {
          const value = values[field.key] ?? '';
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={`${id}-${field.key}`}
                className="text-fg text-sm font-semibold"
              >
                {i18n.language === 'en' ? field.labelEn : field.labelAr}
              </label>
              <Input
                id={`${id}-${field.key}`}
                dir="auto"
                value={value}
                aria-invalid={value.length > field.maxLength || undefined}
                onChange={(event) =>
                  setValues((v) => ({ ...v, [field.key]: event.target.value }))
                }
              />
              <Counter count={value.length} max={field.maxLength} />
            </div>
          );
        })}
        <FieldError id={`${id}-error`} error={error} />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() =>
              onAnswer(Object.fromEntries(ui.fields.map((f) => [f.key, ''])))
            }
          >
            {t('chat.agent.noText')}
          </Button>
          <Button type="submit" size="sm" loading={busy} disabled={over}>
            {t('chat.agent.send')}
          </Button>
        </div>
      </Dock>
    </form>
  );
}

const FILE_FIELDS = new Set(['logo', 'extras', 'media']);

function SummaryValue({ field, value }: { field: string; value: string }) {
  const { t } = useTranslation();
  if (field === 'colors') {
    const colors = value.split(/\s+/).filter(Boolean);
    if (colors.length === 0)
      return <span className="text-fg-muted">{t('chat.agent.noColors')}</span>;
    return (
      <span className="flex flex-wrap gap-1.5">
        {colors.map((hex) => (
          <span
            key={hex}
            title={hex}
            className="border-border-subtle size-6 rounded-full border"
            style={{ backgroundColor: hex }}
          />
        ))}
        <span className="sr-only">{value}</span>
      </span>
    );
  }
  if (FILE_FIELDS.has(field) && /^\d+$/.test(value)) {
    return <span>{t('chat.agent.files', { count: Number(value) })}</span>;
  }
  if (!value) {
    return (
      <span className="text-fg-muted">
        {field === 'text' ? t('chat.agent.noText') : '—'}
      </span>
    );
  }
  return (
    <span dir="auto" className="whitespace-pre-wrap">
      {value}
    </span>
  );
}

/**
 * `summary`: the answers so far, «يبدو جيدًا», «تعديل» per item; the request
 * summary also «علامة أخرى» and balance notes, never prices (decided 2026-11-10).
 */
export function SummaryInput({
  ui,
  busy,
  error,
  onAnswer,
  onRequestBalance,
}: InputProps<'summary'> & { onRequestBalance: () => void }) {
  const { t, i18n } = useTranslation();
  const request = ui.step === 'design_summary';
  const estimate = ui.estimate ?? null;
  const short =
    estimate !== null && estimate.fitsVariants < estimate.variants
      ? estimate.fitsVariants
      : null;
  return (
    <Dock>
      <dl className="border-border-subtle divide-border-subtle divide-y rounded-lg border">
        {ui.items.map((item) => {
          const label = i18n.language === 'en' ? item.labelEn : item.labelAr;
          return (
            <div
              key={item.field}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <dt className="text-fg-muted w-24 shrink-0 text-sm">{label}</dt>
              <dd className="text-fg min-w-0 flex-1 text-sm">
                <SummaryValue field={item.field} value={item.value} />
              </dd>
              {ui.editable.includes(item.field) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  aria-label={t('chat.agent.editLabel', { label })}
                  className="text-brand px-2"
                  onClick={() =>
                    onAnswer({ action: 'edit', field: item.field })
                  }
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  {t('chat.agent.edit')}
                </Button>
              ) : null}
            </div>
          );
        })}
      </dl>
      {short !== null && short > 0 ? (
        <Alert variant="info">
          {t('chat.agent.fitsSome', {
            count: short,
            variants: estimate!.variants,
          })}
        </Alert>
      ) : null}
      {short === 0 ? (
        <Alert
          variant="warning"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRequestBalance}
            >
              {t('chat.agent.requestBalance')}
            </Button>
          }
        >
          {t('chat.agent.fitsNone')}{' '}
          <TextLink to="/balance">{t('chat.agent.balance')}</TextLink>
        </Alert>
      ) : null}
      <FieldError id="agent-summary-error" error={error} />
      <div className="flex flex-wrap justify-end gap-2">
        {request ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => onAnswer({ action: 'change_brand' })}
          >
            {t('chat.agent.anotherBrand')}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          loading={busy}
          disabled={short === 0}
          onClick={() => onAnswer({ action: 'confirm' })}
        >
          <Check aria-hidden="true" />
          {t('chat.agent.looksGood')}
        </Button>
      </div>
    </Dock>
  );
}

/** `none`: nothing to answer (the plan allows no brand kits). */
export function NoneInput() {
  const { t } = useTranslation();
  return (
    <Alert
      variant="info"
      action={
        <Button asChild variant="secondary" size="sm">
          <Link to="/plans">{t('chat.agent.viewPlans')}</Link>
        </Button>
      }
    >
      {t('chat.agent.limitReached')}
    </Alert>
  );
}
