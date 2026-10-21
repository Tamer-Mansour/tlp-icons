import '@fontsource-variable/inter';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Runtime from '@/components/Runtime';
import { SITE_URL, total, categories } from '@/lib/data';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'tlp-icons — every icon, animated', template: '%s · tlp-icons' },
  description: `${total().toLocaleString('en')} free, open-source animated SVG icons for React, Angular, Vue and HTML. Built from Lucide and Tabler. MIT licensed.`,
  keywords: ['animated icons', 'svg icons', 'icon library', 'react icons', 'angular icons', 'vue icons', 'web components', 'lucide', 'tabler icons', 'free icons'],
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon-32.png', sizes: '32x32' }], apple: '/apple-touch-icon.png' },
  openGraph: { type: 'website', siteName: 'tlp-icons', images: ['/og-image.png'] },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  alternates: { canonical: '/' },
};

export const viewport = { themeColor: '#741D3D' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Header />
        <main>{children}</main>
        <Footer count={total()} cats={categories().slice(0, 6).map(c => ({ id: c.id, title: c.title }))} />
        <Runtime />
      </body>
    </html>
  );
}
