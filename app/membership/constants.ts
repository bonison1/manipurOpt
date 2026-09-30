export const CATEGORIES = ['Regular Member', 'Student Member', 'Associate Member'] as const;

export const DISTRICTS = [
  'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
  'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl',
  'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul',
  'Outside Manipur',
] as const;

// PLACEHOLDER fees in INR. Replace with the approved MOA fee structure.
export const FEES: Record<(typeof CATEGORIES)[number], number> = {
  'Regular Member': 500,
  'Student Member': 200,
  'Associate Member': 300,
};

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid';

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  applicationNo?: string;
  feeAmount?: number;
  email?: string;
};

export type TrackedApplication = {
  application_no: string;
  full_name: string;
  membership_category: string;
  status: ApplicationStatus;
  payment_status: PaymentStatus;
  fee_amount: number;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
};

export type TrackState = {
  ok: boolean;
  message?: string;
  application?: TrackedApplication;
};

export type OrderResult =
  | {
      ok: true;
      orderId: string;
      amount: number;
      keyId: string;
      name: string;
      email: string;
      phone: string;
    }
  | { ok: false; message: string };

export type VerifyResult = { ok: boolean; message?: string };

/* ------------------------- Multi-step application ------------------------- */

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const HIGHEST_QUALIFICATIONS = ['B.Optom', 'M.Optom', 'PhD-Optometry', 'Others'] as const;

export const DOCS_BUCKET = 'membership-docs';
export const MAX_DOCS_BYTES = 10 * 1024 * 1024; // 10 MB (uploaded straight to storage)

// Single source of truth for which fields belong to which step (used by client + server)
export const STEP_FIELDS = [
  ['full_name', 'date_of_birth', 'gender', 'phone', 'email'],
  [
    'aadhaar', 'voter_id', 'address', 'city', 'district', 'state', 'pin_code', 'country',
    'current_working_details', 'is_independent_practitioner', 'professional_reg_no',
    'membership_category',
  ],
  ['bo_university', 'bo_college', 'college_address', 'bo_completion_date', 'highest_qualification'],
  ['documents_file'],
  ['declaration_accepted'],
] as const;

export type StepResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  applicationNo?: string;
  resume?: boolean; // true => show a "continue your application" link
};

export type ResumeState = { error?: string } | undefined;

export type DraftData = {
  applicationNo: string;
  step: number; // step index to open (0-4)
  values: Record<string, string>;
  aadhaarLast4: string | null;
  documentsName: string | null;
};
