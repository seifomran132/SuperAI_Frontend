import { Check, CircleAlert, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AttachmentDraft } from '../model/attachment-draft';
import type { ImageErrorCode } from '../model/image-input';

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Text for an image error: the API catalog when it has the code, else ours. */
export function useImageErrorText() {
  const { t, i18n } = useTranslation();
  return (code: ImageErrorCode) =>
    i18n.exists(`errors:${code}`)
      ? t(`errors:${code}`)
      : t(`chat.image.errors.${code}`);
}

function ProgressRing({ percent }: { percent: number }) {
  const { t } = useTranslation();
  return (
    <div
      role="progressbar"
      aria-label={t('chat.image.uploading')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="absolute inset-0 flex items-center justify-center rounded-xl bg-fg/45"
    >
      <svg
        viewBox="0 0 48 48"
        className="size-12 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          className="stroke-on-brand/30"
        />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
          className="stroke-on-brand"
        />
      </svg>
    </div>
  );
}

/** The attached image above the text field: uploading, ready or failed. */
export function AttachmentTile({
  draft,
  onRemove,
  onRetry,
}: {
  draft: AttachmentDraft;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const errorText = useImageErrorText();
  if (draft.status === 'empty') return null;

  const previewUrl = draft.status === 'error' ? undefined : draft.previewUrl;
  const failed = draft.status === 'error';

  const remove = (
    <button
      type="button"
      onClick={onRemove}
      aria-label={t('chat.image.remove')}
      className="focus-visible:outline-focus group absolute -end-3 -top-3 inline-flex size-11 items-center justify-center rounded-full outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="bg-brand text-on-brand border-surface inline-flex size-6 items-center justify-center rounded-full border-2">
        <X aria-hidden="true" className="size-3.5" />
      </span>
    </button>
  );

  if (failed) {
    return (
      <div
        data-slot="attachment-tile"
        className="border-danger-border bg-danger-container relative flex items-center gap-3 rounded-xl border p-3 pe-14"
      >
        <CircleAlert
          aria-hidden="true"
          className="text-danger size-6 shrink-0"
        />
        <p role="alert" className="text-danger text-sm font-medium">
          {errorText(draft.code)}
        </p>
        {draft.retryable ? (
          <button
            type="button"
            onClick={onRetry}
            className="text-danger focus-visible:outline-focus inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-semibold outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {t('common.retry')}
          </button>
        ) : null}
        {remove}
      </div>
    );
  }

  const uploading = draft.status === 'uploading';
  return (
    <div data-slot="attachment-tile" className="flex items-center gap-3">
      <div className="relative">
        <img
          src={previewUrl}
          alt={t('chat.image.alt')}
          className="bg-surface-muted size-[72px] rounded-xl object-cover"
        />
        {uploading ? <ProgressRing percent={draft.progress} /> : null}
        {remove}
      </div>
      {/* One persistent live region: speaks the start and the finish, not each percent. */}
      <p role="status" className="text-fg-muted text-sm">
        {uploading ? (
          <>
            {t('chat.image.uploading')}{' '}
            <span aria-hidden="true" className="tabular-nums">
              {draft.progress}%
            </span>
          </>
        ) : draft.status === 'ready' ? (
          <span className="text-success inline-flex items-center gap-1.5 font-medium">
            <Check aria-hidden="true" className="size-4" />
            {t('chat.image.uploaded')}
          </span>
        ) : null}
      </p>
    </div>
  );
}
