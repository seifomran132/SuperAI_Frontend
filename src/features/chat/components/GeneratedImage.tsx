import { useRef, useState } from 'react';
import { Download, ImageOff, Maximize2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { downloadAttachment } from '../model/attachment-download';
import type {
  MessageAttachment,
  UseAttachmentImage,
} from '../model/image-input';
import { ImageViewer } from './ImageViewer';

const actionClass =
  'text-fg-muted hover:text-fg focus-visible:outline-focus inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-sm outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60';

/**
 * Column-wide but never taller than about 512px (or 60% of the screen): the
 * width follows from the height for tall images (9:16 would otherwise be
 * ~1000px high). Applied to the image, its placeholder and its error box so
 * nothing jumps when one replaces another.
 */
export function imageBox(width: number, height: number) {
  return {
    aspectRatio: `${width} / ${height}`,
    maxWidth: `min(560px, calc(min(60vh, 512px) * ${width} / ${height}))`,
  };
}

/** Shimmer box used while an image loads or is being created; still under reduced motion. */
export function ImagePlaceholder({
  width,
  height,
  label,
}: {
  width: number;
  height: number;
  label: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      style={imageBox(width, height)}
      className="bg-surface-muted text-fg-muted flex w-full animate-pulse items-center justify-center rounded-xl text-sm motion-reduce:animate-none"
    >
      <span aria-hidden="true">{label}</span>
    </div>
  );
}

/**
 * An image the assistant created: column-wide, placeholder at its stored
 * ratio, then the picture with «فتح بالحجم الكامل» and «تنزيل».
 */
export function GeneratedImage({
  attachment,
  useImage,
}: {
  attachment: MessageAttachment;
  useImage: UseAttachmentImage;
}) {
  const { t } = useTranslation();
  const { url, isPending, isError, refetch } = useImage(attachment.id);
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const { width, height } = attachment;

  const download = async () => {
    setDownloading(true);
    try {
      await downloadAttachment(attachment.id);
    } catch {
      toast.error(t('chat.image.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  if (isError || broken) {
    return (
      <div
        style={imageBox(width, height)}
        className="border-danger-border bg-danger-container text-danger flex w-full flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm"
      >
        <p role="alert" className="flex items-center gap-1.5 font-medium">
          <ImageOff aria-hidden="true" className="size-4 shrink-0" />
          {t('chat.image.loadFailed')}
        </p>
        <button
          type="button"
          onClick={() => {
            setBroken(false);
            refetch();
          }}
          className="focus-visible:outline-focus inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 font-semibold outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (isPending || !url) {
    return (
      <ImagePlaceholder
        width={width}
        height={height}
        label={t('chat.image.loading')}
      />
    );
  }

  return (
    <figure className="m-0 flex flex-col items-start gap-1">
      <img
        src={url}
        alt={t('chat.image.generatedAlt')}
        width={width}
        height={height}
        onError={() => setBroken(true)}
        style={imageBox(width, height)}
        className="h-auto w-full rounded-xl"
      />
      <div className="flex flex-wrap items-center gap-1">
        <button
          ref={opener}
          type="button"
          onClick={() => setOpen(true)}
          className={actionClass}
        >
          <Maximize2 aria-hidden="true" className="size-4" />
          {t('chat.image.openFull')}
        </button>
        <button
          type="button"
          disabled={downloading}
          onClick={() => void download()}
          className={actionClass}
        >
          <Download aria-hidden="true" className="size-4" />
          {t('chat.image.download')}
        </button>
      </div>
      <ImageViewer
        open={open}
        onOpenChange={setOpen}
        src={url}
        returnFocusRef={opener}
        onDownload={() => void download()}
        downloading={downloading}
        alt={t('chat.image.generatedAlt')}
      />
    </figure>
  );
}
