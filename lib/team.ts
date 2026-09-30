// Path: lib/team.ts
export type Member = {
  role: string;
  name: string;
  photo: string;
  focus: string; // CSS object-position, moves the crop up or down
};

export const team: Member[] = [
  { role: 'President', name: 'Full name here', photo: '/team/president.jpg', focus: '50% 28%' },
  { role: 'Secretary', name: 'Full name here', photo: '/team/secretary.jpg', focus: '50% 40%' },
  { role: 'Treasurer', name: 'Full name here', photo: '/team/treasurer.jpg', focus: '50% 25%' },
];