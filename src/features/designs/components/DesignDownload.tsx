import { useState, type ReactNode } from 'react';
import { ChevronDown, Download, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import '../i18n';
import {
  STANDARD_SIZE,
  downloadDesign,
  type AspectRatio,
  type ExportFormat,
  type ExportSize,
} from '../model/designs';

const FORMATS: ExportFormat[] = ['png', 'jpg', 'webp'];

/**
 * «تنزيل» downloads with the chosen type and size in one click; the arrow
 * opens the options. On phones the button opens a sheet with the options and
 * its own «تنزيل» (S28, approved 2026-11-11).
 */
export function DesignDownload({
  designId,
  aspectRatio,
  label,
}: {
  designId: string;
  aspectRatio: AspectRatio;
  /** Accessible name, e.g. «تنزيل التصميم 2». */
  label?: string;
}) {
  const { t } = useTranslation();
  const d = (key: string) => t(`designs.download.${key}`);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [size, setSize] = useState<ExportSize>('original');
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await downloadDesign(designId, format, size);
      setSheet(false);
    } catch {
      toast.error(d('error'));
    } finally {
      setBusy(false);
    }
  };

  const sizeLabel = (value: ExportSize) =>
    value === 'original'
      ? d('original')
      : `${d('standard')} · ${STANDARD_SIZE[aspectRatio]}`;

  const options = (
    <>
      <DropdownMenuLabel className="text-fg-muted text-xs">
        {d('type')}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={format}
        onValueChange={(v) => setFormat(v as ExportFormat)}
      >
        {FORMATS.map((f) => (
          <DropdownMenuRadioItem key={f} value={f}>
            <span dir="ltr">{f.toUpperCase()}</span>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-fg-muted text-xs">
        {d('size')}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={size}
        onValueChange={(v) => setSize(v as ExportSize)}
      >
        {(['original', 'standard'] as const).map((s) => (
          <DropdownMenuRadioItem key={s} value={s}>
            {sizeLabel(s)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      {format === 'jpg' ? (
        <p className="text-fg-muted px-2 py-1.5 text-xs">{d('jpgNote')}</p>
      ) : null}
    </>
  );

  const radio = (
    name: string,
    value: string,
    current: string,
    onPick: () => void,
    text: ReactNode,
  ) => (
    <label
      key={value}
      className="border-border-control has-checked:border-brand has-checked:bg-surface-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3"
    >
      <input
        type="radio"
        name={name}
        checked={current === value}
        onChange={onPick}
        className="accent-brand size-4"
      />
      <span className="text-fg text-sm">{text}</span>
    </label>
  );

  return (
    <>
      <div className="hidden items-stretch sm:flex">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={busy}
          aria-label={label}
          className="rounded-e-none"
          onClick={() => void run()}
        >
          <Download aria-hidden="true" />
          {busy ? d('downloading') : d('action')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label={d('options')}
              className="-ms-px rounded-s-none px-2.5"
            >
              <ChevronDown aria-hidden="true" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {options}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label={label}
        className="sm:hidden"
        onClick={() => setSheet(true)}
      >
        <Download aria-hidden="true" />
        {d('action')}
      </Button>
      <Dialog.Root
        open={sheet}
        onOpenChange={(open) => !busy && setSheet(open)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-50" />
          <Dialog.Content className="bg-surface fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col gap-4 overflow-y-auto rounded-t-lg p-5">
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="text-fg text-lg font-bold">
                {d('title')}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label={d('close')}>
                  <X aria-hidden="true" />
                </Button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              {d('options')}
            </Dialog.Description>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-fg mb-2 text-sm font-semibold">
                {d('type')}
              </legend>
              {FORMATS.map((f) =>
                radio(
                  'design-format',
                  f,
                  format,
                  () => setFormat(f),
                  <span dir="ltr">{f.toUpperCase()}</span>,
                ),
              )}
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-fg mb-2 text-sm font-semibold">
                {d('size')}
              </legend>
              {(['original', 'standard'] as const).map((s) =>
                radio('design-size', s, size, () => setSize(s), sizeLabel(s)),
              )}
            </fieldset>
            {format === 'jpg' ? (
              <p className="text-fg-muted text-sm">{d('jpgNote')}</p>
            ) : null}
            <Button type="button" loading={busy} onClick={() => void run()}>
              <Download aria-hidden="true" />
              {busy ? d('downloading') : d('action')}
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
