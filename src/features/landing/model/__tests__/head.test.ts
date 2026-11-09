import { afterEach, describe, expect, it, vi } from 'vitest';

// env is read when the module loads, so each case imports a fresh copy.
async function headWith(siteOrigin: string | undefined) {
  vi.resetModules();
  vi.stubEnv('VITE_SITE_ORIGIN', siteOrigin);
  const { landingHead } = await import('../head');
  return landingHead();
}

const content = (
  head: Awaited<ReturnType<typeof headWith>>,
  key: string,
): string | undefined =>
  head.meta.find(
    (tag) =>
      ('property' in tag && tag.property === key) ||
      ('name' in tag && tag.name === key),
  )?.content;

describe('landingHead', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('gives previews an absolute image, page and canonical URL', async () => {
    const head = await headWith('https://example.com/');
    expect(content(head, 'og:image')).toBe(
      'https://example.com/brand/lam7a/share.png',
    );
    expect(content(head, 'og:url')).toBe('https://example.com/');
    expect(content(head, 'twitter:card')).toBe('summary_large_image');
    expect(head.links).toEqual([
      { rel: 'canonical', href: 'https://example.com/' },
    ]);
  });

  it('leaves out absolute URLs when the site origin is unknown', async () => {
    const head = await headWith(undefined);
    expect(content(head, 'og:image')).toBeUndefined();
    expect(content(head, 'og:title')).toContain('لمحة AI');
    expect(head.links).toEqual([]);
  });
});
