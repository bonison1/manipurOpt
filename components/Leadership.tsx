// Path: components/Leadership.tsx
import Image from 'next/image';
import { getLeaders } from '@/lib/leadership';

// CSS object-position for the crop; moves the photo up or down inside the frame
const FOCUS = '50% 30%';

export async function Leadership() {
  const team = await getLeaders();

  if (team.length === 0) {
    return <p className="text-muted">Leadership details coming soon.</p>;
  }

  return (
    // Up to 3 columns so photos stay in one line, even on phones; extra members wrap to the next row
    <div
      className="mx-auto grid max-w-xl gap-2.5 sm:gap-6 md:max-w-3xl md:gap-10"
      style={{ gridTemplateColumns: `repeat(${Math.min(team.length, 3)}, minmax(0, 1fr))` }}
    >
      {team.map((m) => (
        <figure key={m.id} className="mx-auto w-full min-w-0 text-center md:max-w-48">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-tint sm:rounded-2xl">
            <Image
              src={m.photo_url}
              alt={m.role ? `${m.name}, ${m.role}` : m.name}
              fill
              sizes="(min-width: 768px) 192px, 30vw"
              className="object-cover"
              style={{ objectPosition: FOCUS }}
            />
          </div>
          <figcaption className="mt-2 sm:mt-3">
            {m.role && <div className="text-[11px] font-medium text-brand sm:text-sm">{m.role}</div>}
            <div className="break-words font-display text-xs font-bold leading-snug sm:text-base">{m.name}</div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default Leadership;