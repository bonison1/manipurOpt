import crypto from 'node:crypto';

export function razorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET');
  }
  return { keyId, keySecret };
}

export function hmacHex(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function createRazorpayOrder(params: {
  amountInr: number;
  receipt: string;
  applicationNo: string;
}) {
  const { keyId, keySecret } = razorpayConfig();

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
    },
    body: JSON.stringify({
      amount: params.amountInr * 100, // paise
      currency: 'INR',
      receipt: params.receipt,
      notes: { application_no: params.applicationNo },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Razorpay order failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as { id: string; amount: number };
}