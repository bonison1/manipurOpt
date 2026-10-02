//Users/macbook/Downloads/moa-website/app/register/benefits.ts
export type Benefit = { title: string; description: string };

export type BenefitGroup = {
  id: 'practitioner' | 'student' | 'institution';
  heading: string;
  benefits: Benefit[];
};

export const BENEFIT_GROUPS: BenefitGroup[] = [
  {
    id: 'practitioner',
    heading: 'Benefits for optometry practitioners',
    benefits: [
      { title: 'Professional recognition', description: 'Be recognised as a registered member of the Manipur Optometrists Association (MOA).' },
      { title: 'Professional identity', description: 'Receive an MOA registration certificate and membership ID, subject to association rules.' },
      { title: 'Professional networking', description: 'Connect with optometrists and eye-care professionals across Manipur.' },
      { title: 'CME & CPD opportunities', description: 'Join continuing education programmes, workshops, seminars and professional events.' },
      { title: 'Career development', description: 'Learn about job opportunities, training programmes and optometry-related activities.' },
      { title: 'Professional updates', description: 'Stay informed about developments and initiatives in optometry across Manipur.' },
      { title: 'Association activities', description: 'Take part in MOA meetings, campaigns, awareness programmes and professional initiatives.' },
      { title: 'Community eye care', description: 'Join vision-screening camps and public eye-health programmes organised or supported by MOA.' },
      { title: 'Professional representation', description: 'Add your voice to collective discussions on the development of the profession.' },
      { title: 'Directory listing', description: 'Eligible practitioners may be listed in the MOA practitioner directory, subject to association policy.' },
    ],
  },
  {
    id: 'student',
    heading: 'Benefits for students',
    benefits: [
      { title: 'Student membership', description: 'Become a registered student member of the Manipur Optometrists Association.' },
      { title: 'Professional identity', description: 'Receive an MOA student registration ID, subject to association rules.' },
      { title: 'Educational opportunities', description: 'Attend seminars, workshops, awareness programmes and other learning activities.' },
      { title: 'Professional networking', description: 'Meet students, practitioners, educators and professionals across Manipur.' },
      { title: 'Career development', description: 'Get involved in professional and community eye-care activities early.' },
      { title: 'Student-to-practitioner discount', description: 'Get 30% off the practitioner registration fee when you upgrade after completing the eligible optometry qualification.' },
      { title: 'Association updates', description: 'Stay informed about MOA programmes, activities and opportunities.' },
    ],
  },
  {
    id: 'institution',
    heading: 'Benefits for institutions',
    benefits: [
      { title: 'Association recognition', description: 'Establish your institution’s link with the professional optometry community in Manipur.' },
      { title: 'Professional networking', description: 'Connect with optometrists, educators, institutions and other stakeholders across the state.' },
      { title: 'Academic collaboration', description: 'Take part in academic programmes, seminars, workshops, CME/CPD activities and events.' },
      { title: 'Student engagement', description: 'Enable your students to join educational and professional activities organised by MOA.' },
      { title: 'Faculty development', description: 'Give faculty access to professional development and knowledge-sharing programmes.' },
      { title: 'Community eye care', description: 'Join outreach programmes, vision-screening camps and public eye-health initiatives.' },
      { title: 'Professional updates', description: 'Receive news on professional activities, educational programmes and developments in optometry.' },
      { title: 'Institutional visibility', description: 'Registered institutions may be listed on the MOA website or directory, subject to association policy.' },
      { title: 'Strengthening the profession', description: 'Contribute to initiatives that improve optometry education, professional standards and eye-care services in Manipur.' },
    ],
  },
];