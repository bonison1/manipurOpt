// Path: app/membership/RefreshOnShow.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Back/forward can show a cached copy of a page. Re-run the server check so the login state is always right.
export default function RefreshOnShow() {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) router.refresh();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [router]);

  return null;
}