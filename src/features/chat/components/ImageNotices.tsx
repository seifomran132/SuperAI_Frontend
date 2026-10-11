import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChatNotice } from './ChatNotice';

/** The selected mode can't read the attached image; nothing switches by itself. */
export function ImageModeNotice() {
  const { t } = useTranslation();
  return <ChatNotice>{t('chat.image.modeNotice')}</ChatNotice>;
}

/** A second image was refused; the first one stays. */
export function TooManyImagesNotice() {
  const { t } = useTranslation();
  return <ChatNotice>{t('chat.image.errors.TOO_MANY_ATTACHMENTS')}</ChatNotice>;
}

/** «يقرأ الصور» mark in the mode menu: icon plus text. */
export function ReadsImagesBadge() {
  const { t } = useTranslation();
  return (
    <span className="bg-surface-muted text-fg-muted mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
      <Eye aria-hidden="true" className="size-3.5" />
      {t('chat.image.readsImages')}
    </span>
  );
}
