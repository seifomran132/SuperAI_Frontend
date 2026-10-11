import { useRef, type RefObject } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogClose,
  DialogPortal,
  DialogPrimitive,
  DialogTitle,
} from '~/components/ui/dialog';

/**
 * Full-screen image on the opaque viewer scrim. Escape and the close button
 * close it; focus is trapped inside and returns to the image that opened it.
 */
export function ImageViewer({
  open,
  onOpenChange,
  src,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  /** Where focus goes on close; defaults to whatever had focus when it opened. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();
  const opener = useRef<Element | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="bg-viewer-scrim fixed inset-0 z-50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            opener.current = document.activeElement;
          }}
          // Radix only restores focus to a Dialog.Trigger, and there is none here.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = returnFocusRef?.current ?? opener.current;
            if (target instanceof HTMLElement) target.focus();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center outline-hidden"
        >
          <DialogTitle className="sr-only">{t('chat.image.view')}</DialogTitle>
          <img
            src={src}
            alt={t('chat.image.alt')}
            className="max-h-full w-full object-contain"
          />
          <DialogClose
            aria-label={t('chat.image.close')}
            className="focus-visible:outline-on-brand absolute end-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-viewer-scrim/60 text-on-brand hover:bg-viewer-scrim/80 outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X aria-hidden="true" className="size-6" />
          </DialogClose>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
