import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { highlight, type HighlightToken } from './highlight';
import { useCopy } from './useCopy';

/** Fenced code: always left-to-right, language label, copy at the top-left. */
export function CodeBlock({
  code,
  language,
  streaming = false,
}: {
  code: string;
  language: string | null;
  /** Highlighting waits until the block is complete (it would re-run per delta). */
  streaming?: boolean;
}) {
  const { t } = useTranslation();
  const { copied, copy } = useCopy();
  const [tokens, setTokens] = useState<HighlightToken[][] | null>(null);

  useEffect(() => {
    if (streaming) {
      setTokens(null);
      return;
    }
    let cancelled = false;
    void highlight(code, language).then((result) => {
      if (!cancelled) setTokens(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, streaming]);

  return (
    <div
      dir="ltr"
      className="bg-code-bg text-code-fg border-code-border my-4 overflow-hidden rounded-md border text-start"
    >
      <div className="border-code-border text-code-muted flex min-h-11 items-center justify-between gap-2 border-b ps-2 pe-4 text-xs">
        <button
          type="button"
          onClick={() => void copy(code)}
          className="text-code-muted hover:text-code-fg focus-visible:outline-focus inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 font-sans text-xs outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2"
        >
          {copied ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          <span dir="auto">
            {copied ? t('chat.message.copied') : t('chat.message.copyCode')}
          </span>
        </button>
        <span role="status" className="sr-only">
          {copied ? t('chat.message.copied') : ''}
        </span>
        {language ? <span className="font-mono">{language}</span> : null}
      </div>
      <pre
        tabIndex={0}
        role="region"
        aria-label={t('chat.message.codeRegion')}
        className="focus-visible:outline-focus outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 overflow-x-auto p-4 text-sm leading-6"
      >
        <code className="font-mono">
          {tokens
            ? tokens.map((line, i) => (
                <span key={i}>
                  {line.map((token, j) => (
                    <span key={j} style={{ color: token.color }}>
                      {token.content}
                    </span>
                  ))}
                  {i < tokens.length - 1 ? '\n' : null}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
}
