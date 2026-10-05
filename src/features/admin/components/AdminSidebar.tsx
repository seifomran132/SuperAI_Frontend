import { Link } from '@tanstack/react-router';
import {
  Boxes,
  CreditCard,
  LogOut,
  Menu,
  Settings,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import { cn } from '~/lib/utils';

const item =
  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus';

// F4b screens are listed but disabled until their pages exist.
const soonItems: { key: string; Icon: LucideIcon }[] = [
  { key: 'plans', Icon: CreditCard },
  { key: 'providers', Icon: Menu },
  { key: 'models', Icon: Boxes },
  { key: 'modes', Icon: SlidersHorizontal },
  { key: 'settings', Icon: Settings },
];

/** Admin navigation: brand, sections, and the way back to the app. */
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, i18n } = useTranslation();
  const brandName = i18n.language === 'en' ? brand.name.en : brand.name.ar;
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
          {soonItems.map(({ key, Icon }) => (
            <li key={key}>
              <span
                aria-disabled="true"
                className={cn(item, 'text-fg-subtle cursor-not-allowed')}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span className="flex-1">{t(`admin.nav.${key}`)}</span>
                <span className="text-xs">{t('admin.nav.soon')}</span>
              </span>
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
