import type { ComponentProps } from 'react';
import { cn } from '~/lib/utils';

/** 48px field. Pass dir="ltr" for email, phone and password values. */
export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'bg-surface text-fg placeholder:text-fg-subtle border-border-control h-12 w-full min-w-0 rounded-md border px-4 text-base transition-colors outline-hidden',
        'focus-visible:border-focus focus-visible:outline-focus focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60',
        'aria-invalid:border-danger aria-invalid:border-2',
        'file:text-fg file:me-3 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  );
}
