export type RegType = 'institute' | 'student' | 'clinic';

export type FieldDef = {
  name: string;
  label: string;
  kind: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  options?: readonly string[];
};

export type RegConfig = {
  type: RegType;
  prefix: string; // reference number prefix
  title: string; // hub card + page title
  blurb: string;
  fee: number; // INR, set here only; the server never trusts the browser for it
  fields: FieldDef[];
};

const currentYear = new Date().getFullYear();
export const ADMISSION_YEARS: string[] = Array.from({ length: 15 }, (_, i) => String(currentYear - i));
export const MIN_ADMISSION_YEAR = currentYear - 14;
export const MAX_ADMISSION_YEAR = currentYear;

const contact: FieldDef[] = [
  { name: 'email', label: 'Email', kind: 'email', autoComplete: 'email', maxLength: 120 },
  {
    name: 'phone', label: 'Phone', kind: 'tel', placeholder: '10-digit mobile number',
    pattern: '[0-9]{10}', maxLength: 10, autoComplete: 'tel',
  },
];

export const REGISTRATIONS: Record<RegType, RegConfig> = {
  institute: {
    type: 'institute',
    prefix: 'INS',
    title: 'Institute registration',
    blurb: 'For optometry colleges and institutes.',
    fee: 5000,
    fields: [
      { name: 'name', label: 'Institute name', kind: 'text', maxLength: 150 },
      { name: 'address', label: 'Address', kind: 'textarea', maxLength: 300 },
      ...contact,
      { name: 'affiliation_no', label: 'Affiliation number', kind: 'text', maxLength: 60 },
      { name: 'university_name', label: 'University name', kind: 'text', maxLength: 150 },
    ],
  },
  student: {
    type: 'student',
    prefix: 'STU',
    title: 'Student registration',
    blurb: 'For B.Optom students.',
    fee: 500,
    fields: [
      { name: 'name', label: 'Full name', kind: 'text', maxLength: 100, autoComplete: 'name' },
      { name: 'address', label: 'Address', kind: 'textarea', maxLength: 300 },
      ...contact,
      { name: 'institution_name', label: 'Name of the institution', kind: 'text', maxLength: 150 },
      { name: 'university_name', label: 'Name of the university', kind: 'text', maxLength: 150 },
      {
        name: 'admission_year', label: 'Year of B.Optom admission / batch', kind: 'select',
        options: ADMISSION_YEARS,
      },
    ],
  },
  clinic: {
    type: 'clinic',
    prefix: 'CLN',
    title: 'Eye care / clinic registration',
    blurb: 'For eye care centres and optical clinics.',
    fee: 3000,
    fields: [
      { name: 'name', label: 'Name of the clinic', kind: 'text', maxLength: 150 },
      { name: 'address', label: 'Address', kind: 'textarea', maxLength: 300 },
      ...contact,
      { name: 'registration_no', label: 'Registration number', kind: 'text', maxLength: 60 },
    ],
  },
};

export const REG_TYPES = Object.keys(REGISTRATIONS) as RegType[];

export function isRegType(v: string): v is RegType {
  return (REG_TYPES as string[]).includes(v);
}

// Flat type on purpose (no boolean-discriminated union), same as DobCheck in your code.
export type RegState = {
  ok: boolean;
  error?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  referenceNo?: string;
  email?: string;
  feeAmount?: number;
} | undefined;