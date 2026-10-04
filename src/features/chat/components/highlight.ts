// Syntax highlighting with shiki, loaded on first use (it is large) and with
// a small language set. Until it arrives, code shows as plain text.

export interface HighlightToken {
  content: string;
  color?: string;
}

interface Highlighter {
  codeToTokensBase: (
    code: string,
    options: { lang: string; theme: string },
  ) => HighlightToken[][];
}

const ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  htm: 'html',
  jsonc: 'json',
};

const SUPPORTED = new Set([
  'javascript',
  'typescript',
  'python',
  'json',
  'bash',
  'sql',
  'html',
  'css',
]);

export function resolveLanguage(language: string | null): string | null {
  if (!language) return null;
  const lower = language.toLowerCase();
  const name = ALIASES[lower] ?? lower;
  return SUPPORTED.has(name) ? name : null;
}

let highlighter: Promise<Highlighter> | null = null;

function load(): Promise<Highlighter> {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
      await Promise.all([
        import('shiki/core'),
        import('shiki/engine/javascript'),
      ]);
    return (await createHighlighterCore({
      themes: [import('shiki/themes/github-dark.mjs')],
      langs: [
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/python.mjs'),
        import('shiki/langs/json.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/sql.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/css.mjs'),
      ],
      engine: createJavaScriptRegexEngine(),
    })) as unknown as Highlighter;
  })();
  // A failed load is retried on the next block instead of being cached.
  highlighter.catch(() => {
    highlighter = null;
  });
  return highlighter;
}

/** Tokens per line, or null when the language is not supported or loading failed. */
export async function highlight(
  code: string,
  language: string | null,
): Promise<HighlightToken[][] | null> {
  const lang = resolveLanguage(language);
  if (!lang) return null;
  try {
    const h = await load();
    return h.codeToTokensBase(code, { lang, theme: 'github-dark' });
  } catch {
    return null;
  }
}
