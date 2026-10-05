import { useId, type ReactNode } from 'react';

/** Titled white card; `actions` sit at the end of the title row. */
export function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="bg-surface border-border-subtle grid content-start gap-4 rounded-lg border p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={id} className="text-fg text-lg font-bold">
          {title}
        </h3>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** Message block for empty tables. */
export function EmptyNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-fg text-base font-semibold">{title}</p>
      <p className="text-fg-muted mt-1 text-sm">{body}</p>
    </div>
  );
}
