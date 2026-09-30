// Path: app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Archivo, Public_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const display = Archivo({ subsets: ['latin'], weight: ['800', '900'], variable: '--font-display', display: 'swap' });
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Manipur Optometrist Association | MOA',
  description: 'Advancing optometry. Improving vision. Serving Manipur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-[#F7F8FA] text-[#17203A] antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-[#17203A] px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}