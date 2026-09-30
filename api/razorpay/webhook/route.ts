import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { hmacHex, safeEqual } from '@/lib/razorpay';

export const runtime = 'nodejs';

// Backup path: marks an application as paid even if the applicant closes the tab after paying.
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get('x-razorpay-signature');
  const raw = await req.text(); // signature is computed over the raw body

  if (!secret || !signature || !safeEqual(hmacHex(raw, secret), signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(raw);

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const payment = event.payload?.payment?.entity;
    const orderId: string | undefined = payment?.order_id ?? event.payload?.order?.entity?.id;
    const paymentId: string | undefined = payment?.id;

    if (orderId) {
      const db = createServiceClient();
      const { error } = await db
        .from('membership_applications')
        .update({
          payment_status: 'paid',
          payment_method: 'razorpay',
          razorpay_payment_id: paymentId ?? null,
          paid_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', orderId)
        .eq('payment_status', 'unpaid');

      if (error) {
        console.error('webhook update failed:', error);
        return NextResponse.json({ error: 'db error' }, { status: 500 }); // Razorpay will retry
      }
    }
  }

  return NextResponse.json({ ok: true });
}