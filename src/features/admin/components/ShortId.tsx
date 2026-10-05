import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCopy } from '~/features/chat/components/useCopy';

/** First 8 characters of an id/reference (full value on hover) with a copy button. */
export function ShortId({ value }: { value: string }) {
  const { t } = useTranslation();
  const { copied, copy } = useCopy();
  const short = value.length > 8 ? value.slice(0, 8) : value;
  return (
    <span className="inline-flex items-center gap-1">
      <bdi dir="ltr" title={value} className="font-mono text-xs">
        {short}
      </bdi>
      <button
        type="button"
        aria-label={`${t(copied ? 'admin.common.copied' : 'admin.common.copy')}: ${short}`}
        onClick={() => void copy(value)}
        className="text-fg-muted hover:text-fg focus-visible:outline-focus inline-flex size-11 items-center justify-center rounded-md outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
      </button>
    </span>
  );
}
