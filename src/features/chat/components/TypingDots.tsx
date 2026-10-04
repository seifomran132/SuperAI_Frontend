import { cn } from '~/lib/utils';

/** Three pulsing dots; decorative, the text next to it carries the meaning. */
export function TypingDots({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex items-center gap-1', className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-fg-subtle animate-dot size-1.5 rounded-full"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}
