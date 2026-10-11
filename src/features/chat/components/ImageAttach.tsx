import { useEffect, useRef, useState, type ClipboardEvent } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IMAGE_ACCEPT } from '../model/image-validation';

/** Image-bearing files of a paste, or none when it is plain text. */
export function pastedImages(event: ClipboardEvent): File[] {
  const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
    f.type.startsWith('image/'),
  );
  return files;
}

/** Attach button (not mirrored) with its hidden file input. */
export function AttachButton({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={t('chat.image.attach')}
        onClick={() => input.current?.click()}
        className="text-fg-muted hover:text-fg focus-visible:outline-focus inline-flex size-11 shrink-0 items-center justify-center rounded-full outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
      >
        <ImagePlus aria-hidden="true" className="size-5" />
      </button>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        tabIndex={-1}
        data-testid="image-input"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          // The same file can be picked again after removing it.
          event.target.value = '';
        }}
      />
    </>
  );
}

/**
 * True while a file is dragged over the page; files dropped anywhere are handed
 * to `onFiles`. Does nothing when disabled (no image-capable mode).
 */
export function useFileDrop(
  enabled: boolean,
  onFiles: (files: File[]) => void,
) {
  const [dragging, setDragging] = useState(false);
  const callback = useRef(onFiles);
  callback.current = onFiles;

  useEffect(() => {
    if (!enabled) return;
    let depth = 0;
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes('Files');
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const over = (e: DragEvent) => {
      // Without this the browser would open the file instead of dropping it.
      if (hasFiles(e)) e.preventDefault();
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      callback.current(Array.from(e.dataTransfer?.files ?? []));
    };
    document.addEventListener('dragenter', enter);
    document.addEventListener('dragover', over);
    document.addEventListener('dragleave', leave);
    document.addEventListener('drop', drop);
    return () => {
      document.removeEventListener('dragenter', enter);
      document.removeEventListener('dragover', over);
      document.removeEventListener('dragleave', leave);
      document.removeEventListener('drop', drop);
      setDragging(false);
    };
  }, [enabled]);

  return dragging;
}

/** Dashed drop target shown over the chat while a file is dragged. */
export function DropZoneOverlay() {
  const { t } = useTranslation();
  return (
    <div
      aria-hidden="true"
      data-testid="drop-zone"
      className="bg-surface/90 pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-6"
    >
      <div className="border-border-control bg-surface-muted flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-10 py-12 text-center">
        <Upload aria-hidden="true" className="text-fg-muted size-8" />
        <p className="text-fg text-lg font-semibold">{t('chat.image.drop')}</p>
        <p className="text-fg-muted text-sm">{t('chat.image.dropHint')}</p>
      </div>
    </div>
  );
}
