import { useId, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { MessageSquare, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageScroll } from '~/components/PageScroll';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { useBrandKits } from '~/features/brand-kits';
import { ImageViewer } from '~/features/chat/ui';
import { formatActivityDate } from '~/lib/dates';
import '../i18n';
import {
  DesignCard,
  DesignPreview,
  ReviewNote,
  VersionBadge,
} from '../components/DesignCard';
import { DesignDownload } from '../components/DesignDownload';
import { useDesigns } from '../model/designs';

const selectClass =
  'bg-surface text-fg border-border-control focus-visible:outline-focus h-12 min-w-56 rounded-md border px-3 text-base outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2';

/** `/designs` (S28): every design the graphic designer delivered, newest first. */
export function DesignsPage() {
  const { t, i18n } = useTranslation();
  const filterId = useId();
  const [brandKitId, setBrandKitId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<{ src: string; alt: string } | null>(
    null,
  );
  const list = useDesigns(brandKitId);
  const kits = useBrandKits();
  const brandName = (id: string) => {
    const kit = kits.kits.find((k) => k.id === id);
    if (kit) return kit.name;
    // Only say «deleted» once every kit is known.
    return kits.status === 'success' && !kits.hasNextPage
      ? t('designs.deletedBrand')
      : '';
  };

  let body;
  if (list.status === 'pending') {
    body = (
      <ul
        role="status"
        aria-label={t('designs.loading')}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="bg-surface-muted h-80 animate-pulse rounded-lg"
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
        {t('designs.loadError')}
      </Alert>
    );
  } else if (list.designs.length === 0) {
    body = brandKitId ? (
      <p className="text-fg-muted py-10 text-center">
        {t('designs.emptyBrand')}
      </p>
    ) : (
      <div className="bg-surface border-border-subtle flex flex-col items-center gap-3 rounded-lg border px-6 py-10 text-center">
        <Palette aria-hidden="true" className="text-fg-muted size-10" />
        <h2 className="text-fg text-lg font-bold">{t('designs.emptyTitle')}</h2>
        <p className="text-fg-muted max-w-md text-sm">
          {t('designs.emptyBody')}
        </p>
        <Button asChild variant="secondary">
          <Link to="/chat">{t('designs.startChat')}</Link>
        </Button>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.designs.map((design, index) => {
            const name = brandName(design.brandKitId);
            const label = t('designs.designLabel', { n: index + 1 });
            const date = formatActivityDate(design.createdAt, i18n.language, {
              today: t('balance.activity.today'),
              yesterday: t('balance.activity.yesterday'),
            });
            return (
              <DesignCard
                key={design.id}
                preview={
                  <DesignPreview
                    attachmentId={design.attachmentId}
                    aspectRatio={design.aspectRatio}
                    label={label}
                    className="h-60"
                    onOpen={(src) => setViewing({ src, alt: label })}
                  />
                }
                title={<span dir="auto">{name}</span>}
                badges={
                  <>
                    {design.needsReview ? <ReviewNote /> : null}
                    <VersionBadge version={design.version} />
                  </>
                }
                meta={`${
                  design.kind === 'edit' && !design.format
                    ? t('designs.edited')
                    : t(`designs.formats.${design.format}`)
                } · ${date}`}
                actions={
                  <>
                    <Button asChild variant="secondary" size="sm">
                      <Link
                        to="/chat/$conversationId"
                        params={{ conversationId: design.conversationId }}
                      >
                        <MessageSquare aria-hidden="true" />
                        {t('designs.openChat')}
                      </Link>
                    </Button>
                    <DesignDownload
                      designId={design.id}
                      aspectRatio={design.aspectRatio}
                    />
                  </>
                }
              />
            );
          })}
        </ul>
        {list.isFetchNextPageError ? (
          <Alert variant="danger">{t('designs.loadMoreError')}</Alert>
        ) : null}
        {list.hasNextPage ? (
          <Button
            type="button"
            variant="secondary"
            className="self-center"
            loading={list.isFetchingNextPage}
            onClick={() => void list.fetchNextPage()}
          >
            {t('designs.loadMore')}
          </Button>
        ) : null}
      </>
    );
  }

  return (
    <PageScroll>
      <div>
        <h1 className="text-fg text-3xl font-bold">{t('designs.title')}</h1>
        <p className="text-fg-muted mt-2">{t('designs.intro')}</p>
      </div>
      {kits.kits.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor={filterId} className="text-fg text-sm font-semibold">
            {t('designs.brandFilter')}
          </label>
          <select
            id={filterId}
            value={brandKitId ?? ''}
            onChange={(event) => setBrandKitId(event.target.value || null)}
            className={selectClass}
          >
            <option value="">{t('designs.allBrands')}</option>
            {kits.kits.map((kit) => (
              <option key={kit.id} value={kit.id}>
                {kit.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {body}
      {viewing ? (
        <ImageViewer
          open
          onOpenChange={(open) => !open && setViewing(null)}
          src={viewing.src}
          alt={viewing.alt}
        />
      ) : null}
    </PageScroll>
  );
}
