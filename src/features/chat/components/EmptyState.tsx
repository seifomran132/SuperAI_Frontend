import { ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BrandMark } from './BrandMark';

const chipKeys = ['chip1', 'chip2', 'chip3', 'chip4'] as const;

/** New chat: example prompts fill the composer; they never send. */
export function EmptyState({
  onPick,
  imageMode,
}: {
  onPick: (text: string) => void;
  /** The selected mode creates images: other headline, hint and example prompts. */
  imageMode?: boolean;
}) {
  const { t } = useTranslation();
  const prefix = imageMode ? 'chat.emptyImage' : 'chat.empty';
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center">
        <BrandMark className="size-14 rounded-lg" textClassName="text-2xl" />
        <h1 className="text-fg mt-3 text-2xl leading-9 font-bold">
          {t(`${prefix}.title`)}
        </h1>
        <p className="text-fg-muted flex items-center gap-1.5 text-base">
          {imageMode ? (
            <ImagePlus aria-hidden="true" className="size-5 shrink-0" />
          ) : null}
          {imageMode ? t('chat.emptyImage.hint') : t('chat.empty.subtitle')}
        </p>
        <ul className="mt-5 grid w-full max-w-[640px] gap-3 sm:grid-cols-2">
          {chipKeys.map((chip) => {
            const key = `${prefix}.${chip}`;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onPick(t(key))}
                  className="bg-surface border-border-subtle text-fg hover:bg-surface-muted focus-visible:outline-focus min-h-16 w-full rounded-lg border px-4 py-3 text-start text-sm font-medium outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t(key)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
