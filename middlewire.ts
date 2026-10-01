// Path: middleware.ts  (must be named exactly "middleware.ts", next to package.json)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Keeps the Supabase login fresh for admins and members, so they stay logged in until they press Sign out.
// It only refreshes the session cookie. Who may see what is decided inside each page
// (requireAdmin on admin pages, the dashboard check on member pages).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session cookie if it is close to expiring.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/membership/:path*', '/api/auth/me'],
};