// Path: app/admin/login/page.tsx
import type { Metadata } from 'next';
import { Card } from '@/components/ui';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Admin Login | MOA' };

export default function AdminLoginPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-black text-[#073b66]">Admin login</h1>
        <p className="mb-6 text-sm text-slate-500">Authorised MOA administrators only.</p>
        <Card>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}