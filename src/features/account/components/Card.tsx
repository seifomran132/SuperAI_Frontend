import { useId, type ReactNode } from 'react';

/** Titled white card used by every section of the account page. */
export function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="bg-surface border-border-subtle grid content-start gap-5 rounded-lg border p-5 sm:p-6"
    >
      <h2 id={id} className="text-fg text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
