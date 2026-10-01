# Setup for the AIIMS-style redesign

## 1. Append to `app/globals.css`

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee { animation: marquee 40s linear infinite; }
.marquee:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .marquee { animation: none; } }
```

## 2. `app/layout.tsx`

Import the ticker and render it directly above the header:

```tsx
import Ticker from '@/components/Ticker';
// ...
<body>
  <Ticker />
  <Header />
  <main>{children}</main>
  <Footer />
</body>
```

Keep whatever fonts, classes and providers your layout already has. Only add `<Ticker />` above `<Header />`.

## 3. Files in this bundle

| File | Replaces / adds |
| --- | --- |
| `components/Ticker.tsx` | new |
| `components/Header.tsx` | replaces existing |
| `components/Footer.tsx` | replaces existing |
| `app/page.tsx` | replaces existing (ScrollEye removed) |

## Notes

- The ticker links to `/news/[slug]`. Your nav has News commented out, so either enable the news pages or change the link target in `Ticker.tsx`.
- The hero uses your newest gallery photo, falling back to `/public/hero.jpg` if the gallery is empty.
- Remove the Privacy / Terms links in `Footer.tsx` if those pages don't exist.
- If `brand-dark` isn't deep enough for the nav bar, change the token or use `bg-[#0b1a8a]`.