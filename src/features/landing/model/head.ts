import { brand } from '~/brand';

/** Title and description for search engines and link previews. */
export function landingHead() {
  const title = `${brand.name.ar} — ${brand.tagline.ar}`;
  return {
    meta: [
      { title },
      { name: 'description', content: brand.tagline.ar },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'ar' },
      { property: 'og:site_name', content: brand.name.ar },
      { property: 'og:title', content: title },
      { property: 'og:description', content: brand.tagline.ar },
    ],
  };
}
