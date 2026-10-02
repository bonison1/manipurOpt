// Path: lib/hero.ts
import 'server-only';
import { createAdminClient } from '@/lib/auth/admin-client';

export type HeroSettings = {
  title: string;
  tagline: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
};

export type HeroImage = { url: string; path: string | null };

export const HERO_DEFAULTS: HeroSettings = {
  title: 'Manipur Optometrist Association',
  tagline: 'Advancing optometry. Improving vision. Serving Manipur.',
  cta1Label: 'Become a member',
  cta1Href: '/membership',
  cta2Label: 'About MOA',
  cta2Href: '/about',
};

export const HERO_KEYS = {
  url: 'hero_image_url',
  path: 'hero_image_path',
  title: 'hero_title',
  tagline: 'hero_tagline',
  cta1Label: 'hero_cta1_label',
  cta1Href: 'hero_cta1_href',
  cta2Label: 'hero_cta2_label',
  cta2Href: 'hero_cta2_href',
} as const;

// Reads the hero text + image from site_settings. Falls back to the defaults
// (and no image) if nothing is saved yet or the table does not exist.
export async function getHeroContent(): Promise<{ image: HeroImage | null; settings: HeroSettings }> {
  const { data } = await createAdminClient()
    .from('site_settings')
    .select('key, value')
    .in('key', Object.values(HERO_KEYS));

  const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string]));

  // A saved empty value is kept (it hides that element); only a missing key uses the default
  const pick = (k: keyof HeroSettings) => map.get(HERO_KEYS[k]) ?? HERO_DEFAULTS[k];

  const url = map.get(HERO_KEYS.url);

  return {
    image: url ? { url, path: map.get(HERO_KEYS.path) || null } : null,
    settings: {
      title: pick('title'),
      tagline: pick('tagline'),
      cta1Label: pick('cta1Label'),
      cta1Href: pick('cta1Href'),
      cta2Label: pick('cta2Label'),
      cta2Href: pick('cta2Href'),
    },
  };
}

export async function getHeroImage(): Promise<HeroImage | null> {
  return (await getHeroContent()).image;
}