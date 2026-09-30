'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSessionClient } from '@/lib/supabase/session';
import { createServiceClient } from '@/lib/supabase/server';
import { isAllowedAdmin, requireAdmin } from '@/lib/supabase/admin-auth';

export async function adminLogin(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!isAllowedAdmin(email) || !password) {
    redirect('/membership-admin/login?error=1');
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/membership-admin/login?error=1');

  redirect('/membership-admin');
}

export async function adminLogout(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect('/membership-admin/login');
}

export async function updateApplicationStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  const note = String(formData.get('admin_notes') ?? '').trim();

  if (!id || !['pending', 'approved', 'rejected'].includes(status)) {
    redirect('/membership-admin');
  }

  const db = createServiceClient();

  if (status === 'approved') {
    const { data } = await db
      .from('membership_applications')
      .select('payment_status')
      .eq('id', id)
      .maybeSingle();

    if (data?.payment_status !== 'paid') {
      redirect(`/membership-admin/applications/${id}?error=unpaid`);
    }
  }

  const { error } = await db
    .from('membership_applications')
    .update({
      status,
      admin_notes: note || null,
      reviewed_by: status === 'pending' ? null : admin.email,
      reviewed_at: status === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('updateApplicationStatus failed:', error);
    redirect(`/membership-admin/applications/${id}?error=save`);
  }

  revalidatePath('/membership-admin');
  revalidatePath(`/membership-admin/applications/${id}`);
  redirect(`/membership-admin/applications/${id}?saved=1`);
}

export async function markPaidOffline(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/membership-admin');

  const db = createServiceClient();
  const { error } = await db
    .from('membership_applications')
    .update({
      payment_status: 'paid',
      payment_method: 'offline',
      paid_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('payment_status', 'unpaid');

  if (error) {
    console.error('markPaidOffline failed:', error);
    redirect(`/membership-admin/applications/${id}?error=save`);
  }

  revalidatePath('/membership-admin');
  revalidatePath(`/membership-admin/applications/${id}`);
  redirect(`/membership-admin/applications/${id}?saved=1`);
}