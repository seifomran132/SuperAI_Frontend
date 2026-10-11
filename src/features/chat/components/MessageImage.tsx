import { useRef, useState } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  MessageAttachment,
  UseAttachmentImage,
} from '../model/image-input';
import { ImageViewer } from './ImageViewer';

const MAX_HEIGHT_PX = 240;

/** One stored image in a message bubble; tap opens the viewer. */
export function MessageImage({
  attachment,
  useImage,
}: {
  attachment: MessageAttachment;
  useImage: UseAttachmentImage;
}) {
  const { t } = useTranslation();
  const { url, isPending, isError, refetch } = useImage(attachment.id);
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const [broken, setBroken] = useState(false);
  const { width, height } = attachment;

  // The box keeps the stored ratio so the layout does not jump when it loads.
  const box = {
    aspectRatio: `${width} / ${height}`,
    maxHeight: MAX_HEIGHT_PX,
    maxWidth: '100%',
    // Never wider than the max height allows for this ratio.
    width: Math.round((MAX_HEIGHT_PX * width) / height),
  };

  if (isError || broken) {
    return (
      <div
        style={box}
        className="border-danger-border bg-danger-container text-danger flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm"
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
      <div
        role="status"
        aria-label={t('chat.image.loading')}
        style={box}
        className="bg-surface-muted animate-pulse rounded-xl motion-reduce:animate-none"
      />
    );
  }

  return (
    <>
      <button
        ref={opener}
        type="button"
        aria-label={t('chat.image.view')}
        onClick={() => setOpen(true)}
        className="focus-visible:outline-focus block max-w-full rounded-xl outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <img
          src={url}
          alt={t('chat.image.alt')}
          width={width}
          height={height}
          onError={() => setBroken(true)}
          style={{ maxHeight: MAX_HEIGHT_PX }}
          className="h-auto max-w-full rounded-xl object-contain"
        />
      </button>
      <ImageViewer
        open={open}
        onOpenChange={setOpen}
        src={url}
        returnFocusRef={opener}
      />
    </>
  );
}
