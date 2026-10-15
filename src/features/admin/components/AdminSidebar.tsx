import { Link } from '@tanstack/react-router';
import {
  Boxes,
  CreditCard,
  LogOut,
  Menu,
  Settings,
  SlidersHorizontal,
  Tag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import { cn } from '~/lib/utils';
import { useSyncStatus } from '../catalog/model/catalog-sync';

const item =
  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus';

const sections: {
  key: string;
  to:
    | '/admin/plans'
    | '/admin/providers'
    | '/admin/models'
    | '/admin/modes'
    | '/admin/price-updates'
    | '/admin/settings';
  Icon: LucideIcon;
}[] = [
  { key: 'plans', to: '/admin/plans', Icon: CreditCard },
  { key: 'providers', to: '/admin/providers', Icon: Menu },
  { key: 'models', to: '/admin/models', Icon: Boxes },
  { key: 'modes', to: '/admin/modes', Icon: SlidersHorizontal },
  { key: 'priceUpdates', to: '/admin/price-updates', Icon: Tag },
  { key: 'settings', to: '/admin/settings', Icon: Settings },
];

/** Admin navigation: brand, sections, and the way back to the app. */
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, i18n } = useTranslation();
  const brandName = i18n.language === 'en' ? brand.name.en : brand.name.ar;
  // Shared with the price-updates page (one cache entry); no badge on error.
  const openFindings = useSyncStatus().data?.openFindings ?? 0;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        <span
          aria-hidden="true"
          className="bg-brand text-on-brand flex size-9 shrink-0 items-center justify-center rounded-md text-base font-bold"
        >
          {brand.monogram}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-fg text-lg font-bold">{brandName}</span>
          <span className="text-fg-muted text-xs">{t('admin.nav.panel')}</span>
        </span>
      </div>
      <nav aria-label={t('admin.nav.menu')} className="flex-1 px-3 pt-2">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              to="/admin/users"
              onClick={onNavigate}
              className={cn(
                item,
                'text-fg-muted hover:bg-surface-muted hover:text-fg',
              )}
              activeProps={{
                className: 'bg-surface-muted text-fg font-semibold',
                'aria-current': 'page',
              }}
            >
              <Users aria-hidden="true" className="size-5" />
              {t('admin.nav.users')}
            </Link>
          </li>
          {sections.map(({ key, to, Icon }) => (
            <li key={key}>
              <Link
                to={to}
                onClick={onNavigate}
                // The visible number is aria-hidden: the count is said in words.
                aria-label={
                  key === 'priceUpdates' && openFindings > 0
                    ? t('admin.nav.priceUpdatesCount', { n: openFindings })
                    : undefined
                }
                className={cn(
                  item,
                  'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )}
                activeProps={{
                  className: 'bg-surface-muted text-fg font-semibold',
                  'aria-current': 'page',
                }}
              >
                <Icon aria-hidden="true" className="size-5" />
                {t(`admin.nav.${key}`)}
                {key === 'priceUpdates' && openFindings > 0 ? (
                  <span
                    aria-hidden="true"
                    className="bg-warning text-on-brand ms-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-xs leading-6 font-bold tabular-nums"
                  >
                    {openFindings}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-border-subtle border-t p-3">
        <Link
          to="/chat"
          onClick={onNavigate}
          className={cn(
            item,
            'text-fg-muted hover:bg-surface-muted hover:text-fg',
          )}
        >
          <LogOut aria-hidden="true" className="size-5 rtl:-scale-x-100" />
          {t('admin.nav.backToApp')}
        </Link>
      </div>
    </div>
  );
}
