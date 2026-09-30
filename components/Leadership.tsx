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
    <div className="flex flex-wrap justify-center gap-8 md:gap-10">
      {team.map((m) => (
        <figure key={m.role} className="w-36 text-center sm:w-40 md:w-48">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-tint">
            <Image
              src={m.photo}
              alt={`${m.name}, ${m.role}`}
              fill
              sizes="192px"
              className="object-cover"
              style={{ objectPosition: m.focus }}
            />
          </div>
          <figcaption className="mt-3">
            <div className="text-sm font-medium text-brand">{m.role}</div>
            <div className="font-display text-base font-bold leading-snug">{m.name}</div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default Leadership;