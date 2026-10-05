import { useTranslation } from 'react-i18next';
import { BrandMark } from './BrandMark';

const chipKeys = [
  'chat.empty.chip1',
  'chat.empty.chip2',
  'chat.empty.chip3',
  'chat.empty.chip4',
] as const;

/** New chat: example prompts fill the composer; they never send. */
export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center">
        <BrandMark className="size-14 rounded-lg" textClassName="text-2xl" />
        <h1 className="text-fg mt-3 text-2xl leading-9 font-bold">
          {t('chat.empty.title')}
        </h1>
        <p className="text-fg-muted text-base">{t('chat.empty.subtitle')}</p>
        <ul className="mt-5 grid w-full max-w-[640px] gap-3 sm:grid-cols-2">
          {chipKeys.map((key) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => onPick(t(key))}
                className="bg-surface border-border-subtle text-fg hover:bg-surface-muted focus-visible:outline-focus min-h-16 w-full rounded-lg border px-4 py-3 text-start text-sm font-medium outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t(key)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
