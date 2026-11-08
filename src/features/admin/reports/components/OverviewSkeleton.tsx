import { useTranslation } from 'react-i18next';

const block = 'bg-surface-muted motion-safe:animate-pulse rounded-lg';

/** Placeholder shapes of the dashboard; the picker above it stays active. */
export function OverviewSkeleton() {
  const { t } = useTranslation();
  return (
    <div aria-busy="true" className="grid gap-6">
      <p role="status" className="text-fg-muted text-sm">
        {t('reports.state.loading')}
      </p>
      <div aria-hidden="true" className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`${block} h-24`} />
          <div className={`${block} h-24`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${block} h-28`} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${block} h-36`} />
          ))}
        </div>
        <div className={`${block} h-80`} />
      </div>
    </div>
  );
}
