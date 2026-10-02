// Path: lib/banner.ts
import 'server-only';
import { createAdminClient } from '@/lib/auth/admin-client';
import { getGalleryImages } from '@/lib/gallery';

export type BannerSettings = {
  title: string;
  linkLabel: string;
  ctaLabel: string;
  ctaHref: string;
};

export type BannerSlide = {
  id: string;
  alt: string | null;
  photo_url: string;
  sort_order: number;
};

export const BANNER_DEFAULTS: BannerSettings = {
  title: 'Moments from MOA',
  linkLabel: 'View full gallery',
  ctaLabel: 'Become a member',
  ctaHref: '/membership',
};

export const BANNER_KEYS = {
  title: 'banner_title',
  linkLabel: 'banner_link_label',
  ctaLabel: 'banner_cta_label',
  ctaHref: 'banner_cta_href',
} as const;

export async function getBannerSettings(): Promise<BannerSettings> {
  const { data } = await createAdminClient()
    .from('site_settings')
    .select('key, value')
    .in('key', Object.values(BANNER_KEYS));

  const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string]));
  // A saved empty value is kept (it hides that element); only a missing key falls back to the default
  const pick = (k: keyof BannerSettings) => map.get(BANNER_KEYS[k]) ?? BANNER_DEFAULTS[k];

  return {
    title: pick('title'),
    linkLabel: pick('linkLabel'),
    ctaLabel: pick('ctaLabel'),
    ctaHref: pick('ctaHref'),
  };
}

export async function getBannerSlides(): Promise<BannerSlide[]> {
  const { data } = await createAdminClient()
    .from('banner_slides')
    .select('id, alt, photo_url, sort_order')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  return (data ?? []) as BannerSlide[];
}

// Homepage: admin-chosen slides, or the latest gallery photos if none were added yet
// Homepage: admin-chosen slides, or the first gallery photos (by admin order) if none were added yet
export async function getBannerContent() {
  const [settings, slides] = await Promise.all([getBannerSettings(), getBannerSlides()]);

  const photos: { src: string; alt: string }[] =
    slides.length > 0
      ? slides.map((s) => ({ src: s.photo_url, alt: s.alt || settings.title }))
      : (await getGalleryImages(6)).map((g) => ({ src: g.src, alt: g.alt }));

  return { settings, photos };
}