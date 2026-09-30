// Path: components/Cta.tsx
import Link from 'next/link';

type Variant = 'primary' | 'ghost' | 'mint';

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  ghost: 'border border-brand/30 bg-white text-brand-dark hover:border-brand hover:bg-tint',
  mint: 'bg-mint text-ink hover:bg-white',
};

export default function Cta({
  href,
  variant = 'primary',
  className = '',
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}