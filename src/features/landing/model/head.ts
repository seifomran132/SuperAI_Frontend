import { brand, brandAsset } from '~/brand';
import { env } from '~/lib/env';

/** Title, description and link preview for `/` (prerendered). */
export function landingHead() {
  const title = `${brand.name.ar} — ${brand.tagline.ar}`;
  // Previews need absolute URLs; without a site origin (tests, local) they are left out.
  const site = env.siteOrigin;
  const absolute = site
    ? [
        { property: 'og:url', content: `${site}/` },
        { property: 'og:image', content: `${site}${brandAsset('share.png')}` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: title },
      ]
    : [];
  return {
    meta: [
      { title },
      { name: 'description', content: brand.tagline.ar },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'ar' },
      { property: 'og:site_name', content: brand.name.ar },
      { property: 'og:title', content: title },
      { property: 'og:description', content: brand.tagline.ar },
      ...absolute,
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: site ? [{ rel: 'canonical', href: `${site}/` }] : [],
  };
}
