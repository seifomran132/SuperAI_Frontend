import {
  Children,
  createContext,
  isValidElement,
  memo,
  useContext,
  type ComponentProps,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { closeUnfinished } from './close-unfinished';

// Assistant answers only. Raw HTML is never rendered (no rehype-raw), images
// are never loaded (a remote image would be fetched without a click, which can
// leak data), links open in a new tab, every block picks its own direction
// (Arabic paragraphs read right-to-left, English ones left-to-right),
// `*emphasis*` is weight 600 (Arabic is never italic) and inline code is
// isolated so it stays LTR.

/** Lets one stable component map know whether the answer is still streaming. */
export const StreamingContext = createContext(false);

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textOf(child.props.children)
          : '',
    )
    .join('');

// react-markdown passes the hast `node`; it must not reach the DOM.
type Props<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T> & {
  node?: unknown;
};

const block =
  <
    T extends
      'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'ul' | 'ol' | 'blockquote',
  >(
    Tag: T,
    className: string,
  ) =>
  ({ node: _node, ...props }: Props<T>) => {
    const Component = Tag as 'p';
    return (
      <Component
        dir="auto"
        className={className}
        {...(props as ComponentProps<'p'>)}
      />
    );
  };

const heading = 'mt-4 mb-2 text-base font-semibold first:mt-0';

function CodeFromPre({ children }: { children?: ReactNode }) {
  const streaming = useContext(StreamingContext);
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    return <pre>{children}</pre>;
  }
  const language =
    /language-([\w+#-]+)/.exec(child.props.className ?? '')?.[1] ?? null;
  const code = textOf(child.props.children).replace(/\n$/, '');
  return <CodeBlock code={code} language={language} streaming={streaming} />;
}

const components: Components = {
  p: block('p', 'my-3 first:mt-0 last:mb-0'),
  h1: block('h2', 'mt-6 mb-3 text-xl leading-8 font-bold first:mt-0'),
  h2: block('h2', 'mt-6 mb-3 text-xl leading-8 font-bold first:mt-0'),
  h3: block('h3', 'mt-5 mb-2 text-lg leading-7 font-semibold first:mt-0'),
  h4: block('h4', heading),
  h5: block('h5', heading),
  h6: block('h6', heading),
  ul: block('ul', 'my-3 list-disc space-y-1 ps-6 marker:text-fg-subtle'),
  ol: block('ol', 'my-3 list-decimal space-y-1 ps-6 marker:text-fg-subtle'),
  li: ({ node: _n, ...props }) => <li className="ps-1" {...props} />,
  blockquote: block(
    'blockquote',
    'border-border-control text-fg-muted my-3 border-s-4 ps-4',
  ),
  hr: () => <hr className="border-border-subtle my-6" />,
  a: ({ node: _n, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand focus-visible:outline-focus rounded-sm font-medium underline underline-offset-4 outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
    />
  ),
  // Never an <img>: the browser would fetch the URL as soon as it renders.
  // The alt text shows, and the address is a plain link the user may open.
  img: ({ node: _n, src, alt }) =>
    typeof src === 'string' && src ? (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand rounded-sm font-medium underline underline-offset-4"
      >
        {alt || src}
      </a>
    ) : (
      <span>{alt}</span>
    ),
  strong: ({ node: _n, ...props }) => (
    <strong className="font-bold" {...props} />
  ),
  // Weight instead of italics: slanted Arabic breaks letter joining.
  em: ({ node: _n, ...props }) => (
    <em className="font-semibold not-italic" {...props} />
  ),
  del: ({ node: _n, ...props }) => <del {...props} />,
  table: ({ node: _n, ...props }) => (
    <div className="border-border-subtle my-4 overflow-x-auto rounded-md border">
      <table dir="auto" className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: ({ node: _n, ...props }) => (
    <thead className="bg-surface-muted" {...props} />
  ),
  th: ({ node: _n, ...props }) => (
    <th
      className="border-border-subtle border-b px-3 py-2 text-start font-semibold"
      {...props}
    />
  ),
  td: ({ node: _n, ...props }) => (
    <td
      className="border-border-subtle border-b px-3 py-2 text-start"
      {...props}
    />
  ),
  input: ({ node: _n, ...props }) => (
    <input {...props} disabled className="me-2 align-middle" />
  ),
  // Block code is rendered from the <code> child here; the `code` override
  // below therefore only ever sees inline code.
  pre: ({ node: _n, children }) => <CodeFromPre>{children}</CodeFromPre>,
  code: ({ node: _n, children }) => (
    <bdi dir="ltr">
      <code className="bg-surface-muted rounded-sm px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    </bdi>
  ),
};

export const Markdown = memo(function Markdown({
  text,
  streaming = false,
}: {
  text: string;
  streaming?: boolean;
}) {
  return (
    <StreamingContext.Provider value={streaming}>
      <div
        className={`text-fg min-w-0 text-base leading-[1.75] wrap-anywhere${streaming ? ' md-streaming' : ''}`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {streaming ? closeUnfinished(text) : text}
        </ReactMarkdown>
      </div>
    </StreamingContext.Provider>
  );
});
