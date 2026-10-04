import type { ComponentProps } from 'react';
import { createLink } from '@tanstack/react-router';
import { cn } from '~/lib/utils';

function TextLinkAnchor({ className, ...props }: ComponentProps<'a'>) {
  return (
    <a
      className={cn(
        'text-brand focus-visible:outline-focus inline-flex min-h-11 items-center rounded-sm text-sm font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      {...props}
    />
  );
}

/** Router link styled as an inline text link (44px touch target). */
export const TextLink = createLink(TextLinkAnchor);
