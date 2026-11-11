import { useId, useRef, useState, type DragEvent } from 'react';
import {
  Camera,
  FileText,
  ImageOff,
  RotateCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BrandAssetDto } from '~/api/generated/types.gen';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import '../i18n';
import { useBrandAssetImage } from '../model/queries';
import { acceptFor, formatMegabytes, type AssetKind } from '../model/rules';
import type { PendingUpload } from '../model/useAssetUploads';

/**
 * Drop zone on wider screens; on phones two buttons, choose files and take a
 * photo (no camera for guidelines, which are usually PDFs).
 */
export function AssetDropZone({
  kind,
  onFiles,
  disabled = false,
  multiple = true,
  describedBy,
}: {
  kind: AssetKind;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  describedBy?: string;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const picker = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const hint = t(
    kind === 'guideline'
      ? 'brandKits.assets.hintGuideline'
      : 'brandKits.assets.hintImages',
  );
  const describe = [hintId, describedBy].filter(Boolean).join(' ');

  const take = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    if (!disabled) take(event.dataTransfer.files);
  };

  return (
    <div>
      <input
        ref={picker}
        type="file"
        hidden
        multiple={multiple}
        accept={acceptFor(kind)}
        onChange={(event) => {
          take(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={camera}
        type="file"
        hidden
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          take(event.target.files);
          event.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={disabled}
        aria-describedby={describe}
        onClick={() => picker.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'focus-visible:outline-focus hidden w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid sm:flex',
          over
            ? 'border-focus bg-mode-2-container'
            : 'border-border-control bg-surface hover:bg-surface-muted',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <Upload aria-hidden="true" className="text-fg size-6" />
        <span className="text-fg font-semibold">
          {t('brandKits.assets.drop')}
        </span>
      </button>
      <div className="flex flex-wrap gap-2 sm:hidden">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          aria-describedby={describe}
          onClick={() => picker.current?.click()}
          className="flex-1"
        >
          <Upload aria-hidden="true" />
          {t('brandKits.assets.pick')}
        </Button>
        {kind === 'guideline' ? null : (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => camera.current?.click()}
            className="flex-1"
          >
            <Camera aria-hidden="true" />
            {t('brandKits.assets.camera')}
          </Button>
        )}
      </div>
      <p id={hintId} className="text-fg-muted mt-2 text-sm sm:text-center">
        {hint}
      </p>
    </div>
  );
}

const tileClass =
  'border-border-subtle bg-surface relative aspect-square overflow-hidden rounded-lg border';

/** A stored file: its preview (images) or a PDF tile, with delete. */
export function AssetTile({
  kitId,
  asset,
  label,
  onDelete,
  deleting = false,
}: {
  kitId: string;
  asset: BrandAssetDto;
  /** Accessible name of the delete button, e.g. «حذف الملف 2 من شعارات». */
  label: string;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const { t } = useTranslation();
  const isPdf = asset.mimeType === 'application/pdf';
  const image = useBrandAssetImage(
    kitId,
    isPdf || !asset.hasPreview ? null : asset.id,
  );
  return (
    <li className={tileClass}>
      {isPdf ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
          <FileText aria-hidden="true" className="text-fg size-8" />
          <span dir="ltr" className="text-fg-muted text-sm tabular-nums">
            {t('brandKits.assets.pdf')} · {formatMegabytes(asset.bytes)}
          </span>
        </div>
      ) : image.url ? (
        <img
          src={image.url}
          alt=""
          className="h-full w-full object-contain p-2"
        />
      ) : image.isError ? (
        <button
          type="button"
          onClick={image.refetch}
          className="text-fg-muted flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-sm"
        >
          <ImageOff aria-hidden="true" className="size-6" />
          {t('brandKits.assets.previewError')}
        </button>
      ) : (
        <div className="bg-surface-muted h-full w-full animate-pulse" />
      )}
      {onDelete ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          loading={deleting}
          aria-label={label}
          onClick={onDelete}
          className="text-danger hover:text-danger absolute end-2 top-2"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      ) : null}
    </li>
  );
}

/** A file being uploaded, or one that failed (S24 frame 3b). */
export function PendingTile({
  item,
  onRetry,
  onDismiss,
}: {
  item: PendingUpload;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const name = item.file.name;
  const failed = item.status === 'failed';
  return (
    <li
      className={cn(
        tileClass,
        'flex flex-col items-center justify-center gap-2 p-3 text-center',
        failed && 'border-danger-border bg-danger-container',
      )}
    >
      <span dir="ltr" className="text-fg w-full truncate text-sm font-medium">
        {name}
      </span>
      {failed ? (
        <>
          <p role="alert" className="text-danger text-sm">
            <span className="sr-only">
              {t('brandKits.assets.failed', { name })}:{' '}
            </span>
            {item.code === 'UPLOAD_FAILED'
              ? t('brandKits.assets.uploadFailed')
              : t(`errors:${item.code}`)}
          </p>
          <span className="flex gap-1">
            {item.retryable ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label={t('brandKits.assets.retry')}
                onClick={onRetry}
              >
                <RotateCw aria-hidden="true" />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={t('brandKits.assets.dismiss')}
              onClick={onDismiss}
            >
              <X aria-hidden="true" />
            </Button>
          </span>
        </>
      ) : (
        <>
          <div
            role="progressbar"
            aria-label={t('brandKits.assets.uploading', { name })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(item.progress)}
            className="bg-surface-muted h-2 w-full overflow-hidden rounded-full"
          >
            <div
              className="bg-brand h-full rounded-full transition-[width]"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span dir="ltr" className="text-fg-muted text-sm tabular-nums">
            {Math.round(item.progress)}%
          </span>
        </>
      )}
    </li>
  );
}
