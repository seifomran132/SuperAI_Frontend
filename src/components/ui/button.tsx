import type { ComponentProps } from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { cn } from '~/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-semibold whitespace-nowrap transition-colors outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-5',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-on-brand hover:bg-brand-hover',
        secondary:
          'bg-surface text-fg border border-border-control hover:bg-surface-muted',
        ghost: 'text-fg hover:bg-surface-muted',
        danger: 'bg-danger text-surface hover:bg-danger/90',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-11 px-4',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps
  extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner, sets aria-busy and blocks further clicks (double submit). */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  if (asChild) {
    // A Slot child (e.g. a link) has no `disabled`; mirror the state with ARIA.
    const inactive = disabled || loading;
    return (
      <Slot.Root
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size }),
          inactive && 'pointer-events-none opacity-60',
          className,
        )}
        aria-disabled={inactive || undefined}
        aria-busy={loading || undefined}
        data-disabled={inactive ? '' : undefined}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      data-slot="button"
      type={type ?? 'button'}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
