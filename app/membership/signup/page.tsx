// Path: app/membership/signup/page.tsx
// Accounts are now created automatically when step 1 of the application is saved.
// Kept only so old links and bookmarks still land somewhere useful.
import { redirect } from 'next/navigation';

export default function SignupPage() {
  redirect('/membership/login');
}
