// Path: components/Leadership.tsx
import Image from 'next/image';

type Member = {
  role: string;
  name: string;
  photo: string;
  focus: string; // CSS object-position, moves the crop up or down
};

// Replace the names below
const team: Member[] = [
  { role: 'President', name: 'Full name here', photo: '/team/president.jpg', focus: '50% 30%' },
  { role: 'Secretary', name: 'Full name here', photo: '/team/secretary.jpg', focus: '50% 30%' },
  { role: 'Treasurer', name: 'Full name here', photo: '/team/treasurer.jpg', focus: '50% 30%' },
];

export function Leadership() {
  return (
    // Always 3 columns, so the photos stay in a single line, even on phones
    <div className="mx-auto grid max-w-xl grid-cols-3 gap-2.5 sm:gap-6 md:max-w-3xl md:gap-10">
      {team.map((m) => (
        <figure key={m.role} className="mx-auto w-full min-w-0 text-center md:max-w-48">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-tint sm:rounded-2xl">
            <Image
              src={m.photo}
              alt={`${m.name}, ${m.role}`}
              fill
              sizes="(min-width: 768px) 192px, 30vw"
              className="object-cover"
              style={{ objectPosition: m.focus }}
            />
          </div>
          <figcaption className="mt-2 sm:mt-3">
            <div className="text-[11px] font-medium text-brand sm:text-sm">{m.role}</div>
            <div className="break-words font-display text-xs font-bold leading-snug sm:text-base">
              {m.name}
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default Leadership;