import type { ComponentProps } from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cn } from '~/lib/utils';

export function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'text-fg flex items-center gap-2 text-sm leading-6 font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
