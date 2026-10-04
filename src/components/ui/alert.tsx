import type { ComponentProps, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { cn } from '~/lib/utils';

const alertVariants = cva(
  'flex items-start gap-3 rounded-md border p-4 text-sm leading-6',
  {
    variants: {
      variant: {
        danger: 'border-danger-border bg-danger-container text-danger',
        warning: 'border-warning-border bg-warning-container text-warning',
        success: 'border-success/30 bg-success-container text-success',
        info: 'border-border-subtle bg-surface-muted text-fg',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const icons = {
  danger: CircleAlert,
  warning: TriangleAlert,
  success: CircleCheck,
  info: Info,
} as const;

export interface AlertProps
  extends ComponentProps<'div'>, VariantProps<typeof alertVariants> {
  /** Optional action (e.g. a secondary Button or TextLink) shown under the text. */
  action?: ReactNode;
}

/** Inline status message. Errors and warnings are announced (role="alert"). */
export function Alert({
  className,
  variant,
  action,
  children,
  ...props
}: AlertProps) {
  const tone = variant ?? 'info';
  const Icon = icons[tone];
  return (
    <div
      data-slot="alert"
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant: tone }), className)}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
        <div data-slot="alert-description" className="font-medium">
          {children}
        </div>
        {action}
      </div>
    </div>
  );
}
