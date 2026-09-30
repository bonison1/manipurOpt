'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { createRazorpayOrder, hmacHex, razorpayConfig, safeEqual } from '@/lib/razorpay';
import {
  type OrderResult,
  type TrackState,
  type TrackedApplication,
  type VerifyResult,
} from './constants';

const clean = (v: unknown) => String(v ?? '').trim();
const cleanNo = (v: unknown) => clean(v).toUpperCase();
const cleanEmail = (v: unknown) => clean(v).toLowerCase();

/* ------------------------------ Track ------------------------------ */

export async function trackApplication(applicationNo: string, email: string): Promise<TrackState> {
  const no = cleanNo(applicationNo);
  const mail = cleanEmail(email);

  if (!no || !mail) {
    return { ok: false, message: 'Enter your registration number and email.' };
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from('membership_applications')
    .select(
      'application_no, full_name, membership_category, status, payment_status, fee_amount, created_at, reviewed_at, admin_notes, is_draft'
    )
    .eq('application_no', no)
    .eq('email', mail)
    .maybeSingle();

  if (error) {
    console.error('track failed:', error);
    return { ok: false, message: 'Could not check the status. Please try again.' };
  }
  if (!data) {
    return { ok: false, message: 'No application found for that number and email.' };
  }

  if (data.is_draft) {
    return {
      ok: false,
      message:
        'This application is not submitted yet. Use "Continue application" with your email and date of birth to finish it.',
    };
  }

  return { ok: true, application: data as TrackedApplication };
}

/* ------------------------------ Payment ------------------------------ */

export async function createPaymentOrder(applicationNo: string, email: string): Promise<OrderResult> {
  const db = createServiceClient();

  const { data: app } = await db
    .from('membership_applications')
    .select('id, application_no, full_name, email, phone, fee_amount, status, payment_status, razorpay_order_id')
    .eq('application_no', cleanNo(applicationNo))
    .eq('email', cleanEmail(email))
    .maybeSingle();

  if (!app) return { ok: false, message: 'Application not found.' };
  if (app.payment_status === 'paid') return { ok: false, message: 'This application is already paid.' };
  if (app.status === 'rejected') return { ok: false, message: 'This application was not approved.' };
  if (app.fee_amount <= 0) return { ok: false, message: 'No fee is set for this application.' };

  try {
    const { keyId } = razorpayConfig();

    // One Razorpay order per application; reuse it for retries.
    let orderId: string | null = app.razorpay_order_id;
    if (!orderId) {
      const order = await createRazorpayOrder({
        amountInr: app.fee_amount,
        receipt: app.application_no,
        applicationNo: app.application_no,
      });
      orderId = order.id;

      const { error } = await db
        .from('membership_applications')
        .update({ razorpay_order_id: orderId })
        .eq('id', app.id);
      if (error) throw error;
    }

    return {
      ok: true,
      orderId: orderId as string,
      amount: app.fee_amount * 100,
      keyId,
      name: app.full_name,
      email: app.email,
      phone: app.phone,
    };
  } catch (e) {
    console.error('createPaymentOrder failed:', e);
    return { ok: false, message: 'Could not start the payment. Please try again.' };
  }
}

export async function verifyPayment(
  applicationNo: string,
  email: string,
  resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
): Promise<VerifyResult> {
  const db = createServiceClient();

  const { data: app } = await db
    .from('membership_applications')
    .select('id, razorpay_order_id, payment_status')
    .eq('application_no', cleanNo(applicationNo))
    .eq('email', cleanEmail(email))
    .maybeSingle();

  if (!app || app.razorpay_order_id !== resp.razorpay_order_id) {
    return { ok: false, message: 'This payment does not match the application.' };
  }

  const { keySecret } = razorpayConfig();
  const expected = hmacHex(`${resp.razorpay_order_id}|${resp.razorpay_payment_id}`, keySecret);

  if (!safeEqual(expected, resp.razorpay_signature)) {
    return {
      ok: false,
      message:
        'Payment could not be verified. If money was deducted, contact MOA with your registration number.',
    };
  }

  if (app.payment_status !== 'paid') {
    const { error } = await db
      .from('membership_applications')
      .update({
        payment_status: 'paid',
        payment_method: 'razorpay',
        razorpay_payment_id: resp.razorpay_payment_id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', app.id);

    if (error) {
      console.error('verifyPayment update failed:', error);
      return { ok: false, message: 'Payment received but saving failed. Contact MOA with your registration number.' };
    }
  }

  return { ok: true };
}