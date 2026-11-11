import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Palette, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageScroll } from '~/components/PageScroll';
import { TextLink } from '~/components/TextLink';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import '../i18n';
import { KitCard } from '../components/KitCard';
import { NewKitDialog } from '../components/NewKitDialog';
import { useBrandKits } from '../model/queries';

/** `/brands` (S24 frame 1): the user's brand kits, newest first. */
export function BrandKitsPage() {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const list = useBrandKits();
  const atLimit = list.limit !== null && list.kits.length >= list.limit;

  let body;
  if (list.status === 'pending') {
    body = (
      <ul
        role="status"
        aria-label={t('brandKits.loading')}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="bg-surface-muted h-32 animate-pulse rounded-lg"
          />
        ))}
      </ul>
    );
  } else if (list.status === 'error') {
    body = (
      <Alert
        variant="danger"
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void list.refetch()}
          >
            {t('common.retry')}
          </Button>
        }
      >
        {t('brandKits.loadError')}
      </Alert>
    );
  } else if (list.kits.length === 0) {
    body = (
      <div className="bg-surface border-border-subtle flex flex-col items-center gap-3 rounded-lg border px-6 py-10 text-center">
        <Palette aria-hidden="true" className="text-fg-muted size-10" />
        <h2 className="text-fg text-lg font-bold">
          {t('brandKits.emptyTitle')}
        </h2>
        <p className="text-fg-muted max-w-md text-sm">
          {t('brandKits.emptyBody')}
        </p>
        <Button asChild variant="secondary">
          <Link to="/chat">{t('brandKits.startChat')}</Link>
        </Button>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.kits.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </ul>
        {list.hasNextPage ? (
          <Button
            type="button"
            variant="secondary"
            className="self-center"
            loading={list.isFetchingNextPage}
            onClick={() => void list.fetchNextPage()}
          >
            {t('brandKits.loadMore')}
          </Button>
        ) : null}
      </>
    );
  }

  return (
    <PageScroll>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-fg text-3xl font-bold">{t('brandKits.title')}</h1>
          <p className="text-fg-muted mt-2">{t('brandKits.intro')}</p>
        </div>
        <Button
          type="button"
          disabled={list.status !== 'success' || atLimit}
          aria-describedby={atLimit ? 'kits-limit' : undefined}
          onClick={() => setCreating(true)}
        >
          <Plus aria-hidden="true" />
          {t('brandKits.new')}
        </Button>
      </div>
      {atLimit ? (
        <p id="kits-limit" className="text-fg-muted -mt-2 text-sm">
          {t('brandKits.limitReached', { count: list.limit ?? 0 })}{' '}
          <TextLink to="/plans">{t('brandKits.viewPlans')}</TextLink>
        </p>
      ) : null}
      {body}
      <NewKitDialog open={creating} onOpenChange={setCreating} />
    </PageScroll>
  );
}
