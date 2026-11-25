import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const description =
  'Chat with Gerald Cahanza’s AI avatar: a QuickBooks Online bookkeeper for US and Australian businesses. Ask about skills, projects and experience, or book a free discovery call.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Gerald Cahanza | QuickBooks Online Bookkeeper for US & AU businesses',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'Ask Gerald anything about your books',
    description,
    siteName: 'Gerald Cahanza',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask Gerald anything about your books',
    description,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000', // the boot script below swaps it to the light value when needed
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

// Runs before first paint: the saved choice, else the system setting. No flash of the wrong theme.
// Colours match THEME_COLOR in components/ThemeToggle.tsx.
const themeBoot = `(function(){var t='dark';try{var s=localStorage.getItem('theme');t=s==='light'||s==='dark'?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}catch(e){}document.documentElement.dataset.theme=t;if(t==='light'){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#f5f8fa');else document.addEventListener('DOMContentLoaded',function(){var n=document.querySelector('meta[name="theme-color"]');if(n)n.setAttribute('content','#f5f8fa')})}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
