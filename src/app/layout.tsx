import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ClientAuthProvider from '@/components/client-auth-provider';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
  display: 'swap',
  preload: false, // Disable preload to avoid timeout
  fallback: ['Arial', 'sans-serif'], // Add fallback fonts
});

export const metadata: Metadata = {
  title: 'Talween Studio - قصص شخصية وصفحات تلوين للأطفال بالذكاء الاصطناعي',
  description: 'أنشئ قصص شخصية مذهلة وصفحات تلوين فريدة لطفلك باستخدام الذكاء الاصطناعي. قصص تعليمية، صفحات تلوين تفاعلية، وذكريات لا تُنسى في انتظارك!',
  keywords: 'قصص أطفال, صفحات تلوين, ذكاء اصطناعي, قصص شخصية, تعليم الأطفال, تلوين رقمي, قصص تفاعلية, منشئ القصص',
  authors: [{ name: 'Talween Studio' }],
  creator: 'Talween Studio',
  publisher: 'Talween Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://talween.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Talween Studio - قصص شخصية وصفحات تلوين للأطفال',
    description: 'أنشئ قصص شخصية مذهلة وصفحات تلوين فريدة لطفلك باستخدام الذكاء الاصطناعي',
    url: 'https://talween.com',
    siteName: 'Talween Studio',
    images: [
      {
        url: '/talween logo new.png',
        width: 1200,
        height: 630,
        alt: 'Talween Studio Logo',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talween Studio - قصص شخصية وصفحات تلوين للأطفال',
    description: 'أنشئ قصص شخصية مذهلة وصفحات تلوين فريدة لطفلك باستخدام الذكاء الاصطناعي',
    images: ['/talween logo new.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/talween logo new.png" />
        <link rel="apple-touch-icon" href="/talween logo new.png" />
        <meta name="theme-color" content="#A2561A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Talween Studio",
              "description": "أنشئ قصص شخصية مذهلة وصفحات تلوين فريدة لطفلك باستخدام الذكاء الاصطناعي",
              "url": "https://talween.com",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "ابدأ مجاناً مع 128 نقطة"
              },
              "creator": {
                "@type": "Organization",
                "name": "Talween Studio"
              },
              "inLanguage": "ar",
              "audience": {
                "@type": "Audience",
                "audienceType": "Children"
              }
            })
          }}
        />
      </head>
      <body className={cn('font-body antialiased', cairo.variable)}>
        <ClientAuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ClientAuthProvider>
      </body>
    </html>
  );
}
