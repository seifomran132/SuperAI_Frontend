import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

/** Scrolling page body inside the app shell's <main>; content is centred and width-capped. */
export function PageScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
