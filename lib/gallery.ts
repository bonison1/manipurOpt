// Path: lib/gallery.ts
import fs from 'node:fs';
import path from 'node:path';

export type GalleryImage = { src: string; alt: string };

const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

export function getGalleryImages(): GalleryImage[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'gallery');
    return fs
      .readdirSync(dir)
      .filter((f) => EXT.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => {
        const label = f.replace(EXT, '').replace(/[-_]+/g, ' ').trim();
        return {
          src: '/gallery/' + encodeURIComponent(f),
          alt: label ? label.charAt(0).toUpperCase() + label.slice(1) : 'MOA photo',
        };
      });
  } catch {
    return []; // folder missing
  }
}