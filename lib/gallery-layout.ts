export type Tile = 'feature' | 'tall' | 'wide' | 'std';

// Position 1..10 repeats forever (11 = feature again, etc.).
// This 10-slot cycle tiles a 4-column grid with no gaps.
export const PATTERN: Tile[] = [
  'feature', // 1  2x2
  'tall',    // 2  1x2
  'std',     // 3
  'std',     // 4
  'wide',    // 5  2x1
  'std',     // 6
  'std',     // 7
  'std',     // 8
  'wide',    // 9  2x1
  'std',     // 10
];

// index is the 0-based position in the ordered list
export const tileFor = (index: number): Tile => PATTERN[index % PATTERN.length];

// Public grid (fixed row height, image fills the tile)
export const TILE_SPAN: Record<Tile, string> = {
  feature: 'col-span-2 row-span-2',
  tall: 'row-span-2',
  wide: 'col-span-2',
  std: '',
};

// Admin card preview
export const TILE_ASPECT: Record<Tile, string> = {
  feature: 'aspect-[4/3]',
  tall: 'aspect-[3/4]',
  wide: 'aspect-[16/9]',
  std: 'aspect-[4/3]',
};

export const TILE_LABEL: Record<Tile, string> = {
  feature: 'Featured',
  tall: 'Tall',
  wide: 'Wide',
  std: 'Standard',
};

export const TILE_DIMS: Record<Tile, string> = {
  feature: '2×2',
  tall: '1×2',
  wide: '2×1',
  std: '1×1',
};