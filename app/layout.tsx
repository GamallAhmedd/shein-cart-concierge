import type { Metadata } from 'next';
import Script from 'next/script';
import { IBM_Plex_Sans_Arabic, Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { FloatingSupportButton } from '@/components/FloatingSupportButton';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SHEIN Concierge Egypt — اختياراتك من شي إن لحد باب بيتك',
  description:
    'خدمة كونسيرج تسوق للعميلات في مصر: شاركي رابط سلتك، اعرفي التكلفة بالجنيه المصري، وادفعي محلياً عبر إنستاباي أو فودافون كاش مع التوصيل لباب بيتك.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{document.documentElement.classList.remove('dark');localStorage.removeItem('shein_app_theme_v1');localStorage.setItem('shein_app_theme_v3_ice','light');}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#DDE3E8] text-[#3A0F34]">
        <Providers>
          {children}
          <FloatingSupportButton />
          <Analytics />
          <SpeedInsights />
        </Providers>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
