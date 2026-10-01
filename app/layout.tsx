// Path: app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Archivo, Public_Sans } from 'next/font/google';
import Ticker from '@/components/Ticker';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getMe } from '@/lib/auth/get-me';

const display = Archivo({ subsets: ['latin'], weight: ['800', '900'], variable: '--font-display', display: 'swap' });
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Manipur Optometrist Association | MOA',
  description: 'Advancing optometry. Improving vision. Serving Manipur.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Who is signed in? The header uses this to show Profile + Log out instead of Login
  const me = await getMe();

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-[#F7F8FA] text-[#17203A] antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-[#17203A] px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
        >
          Skip to content
        </a>
        <Ticker />
        <Header initialMe={me} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}