//components/admin/LayoutGuide.tsx
import { PATTERN, TILE_DIMS, TILE_LABEL, TILE_SPAN, type Tile } from '@/lib/gallery-layout';

const COLOR: Record<Tile, string> = {
  feature: 'bg-[#073b66] text-white',
  tall: 'bg-[#0b7bb8] text-white',
  wide: 'bg-[#6fb3d9] text-[#031d33]',
  std: 'bg-slate-200 text-slate-700',
};

export function LayoutGuide() {
  return (
    <div className="mt-8 rounded-xl border bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#073b66]">Layout template</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            The size of a photo depends only on its position. This pattern repeats every 10 photos
            (position 11 is Featured again, 12 is Tall, and so on).
          </p>
        </div>
        <ul className="flex flex-wrap gap-2 text-[11px] font-semibold">
          {(Object.keys(TILE_LABEL) as Tile[]).map((t) => (
            <li key={t} className={`rounded-full px-2.5 py-1 ${COLOR[t]}`}>
              {TILE_LABEL[t]} · {TILE_DIMS[t]}
            </li>
          ))}
        </ul>
      </div>

      <ol className="mt-4 grid max-w-md grid-flow-dense auto-rows-[44px] grid-cols-4 gap-1.5 sm:auto-rows-[52px]">
        {PATTERN.map((tile, i) => (
          <li
            key={i}
            className={`flex flex-col items-center justify-center rounded-lg text-center leading-tight ${TILE_SPAN[tile]} ${COLOR[tile]}`}
          >
            <span className="text-sm font-black">{i + 1}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wide opacity-80">
              {TILE_LABEL[tile]}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs text-slate-500">
        Tip: put your best photo at position 1 (or 11, 21…) to make it the large Featured tile. On
        phones the grid has 2 columns, so tiles may flow slightly differently.
      </p>
    </div>
  );
}

export default LayoutGuide;