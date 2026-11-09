/** Decorative: the figures beside it carry the value. */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <span
      aria-hidden="true"
      className="bg-surface-muted block h-1.5 w-full overflow-hidden rounded-full"
    >
      <span
        className="bg-brand block h-full rounded-full"
        style={{ width: `${percent}%` }}
      />
    </span>
  );
}
