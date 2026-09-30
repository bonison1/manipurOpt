import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cookie-based Supabase Auth client, used for admin sign-in.
export async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component; safe to ignore.
          }
        },
      },
    }
  );
}