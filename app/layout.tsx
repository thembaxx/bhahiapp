import type { Metadata, Viewport } from 'next';
import './globals.css';

const appUrl = process.env.APP_URL || 'https://bahiapp.local';

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'BahiApp – Offline Spaza Shop Book, CRM & SMS Ledger',
  description:
    'Track spaza shop stock, record buy-now-pay-later customer credit offline, view analytics, and send automated SMS reminders in English, isiZulu & Sesotho.',
  applicationName: 'BahiApp',
  keywords: [
    'BahiApp',
    'spaza shop',
    'duka',
    'credit book',
    'bahi-khata',
    'ibhuku',
    'offline POS',
    'micro-ERP',
    'informal retail CRM',
    'isiZulu SMS reminder',
    'Sesotho SMS reminder',
    'South Africa spaza',
  ],
  authors: [{ name: 'BahiApp' }],
  creator: 'BahiApp',
  publisher: 'BahiApp',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BahiApp',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: appUrl,
    siteName: 'BahiApp',
    title: 'BahiApp – Offline Spaza Shop Book, CRM & SMS Ledger',
    description:
      'Track spaza shop stock, record buy-now-pay-later customer credit offline, view analytics, and send automated SMS reminders in English, isiZulu & Sesotho.',
    locale: 'en_ZA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BahiApp – Offline Spaza Shop Book, CRM & SMS Ledger',
    description:
      'Track spaza shop stock, record buy-now-pay-later customer credit offline, view analytics, and send automated SMS reminders in English, isiZulu & Sesotho.',
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'BahiApp',
      alternateName: ['BahiApp Spaza Ledger', 'Bhuku Shop Book'],
      url: appUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      inLanguage: ['en', 'zu', 'st'],
      description:
        'Offline-first micro-ERP, digital credit book (bahi-khata), CRM, barcode inventory scanner, and multi-language SMS reminder web application for spaza shops and informal retailers.',
      featureList: [
        'Offline-first local ledger synchronization',
        'Customer Relationship Management (CRM) with full purchase history',
        'Multi-language SMS reminders in English, isiZulu, and Sesotho',
        'Daily, weekly, and monthly sales and credit analytics',
        'Camera barcode scanner and stock alerts',
        'Printable A4 shop window credit poster',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'ZAR',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does BahiApp work without mobile data or internet?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. BahiApp is an offline-first Progressive Web App (PWA). Sales, customer credit entries, and SMS reminders are stored locally on your phone and queued to sync automatically when connectivity returns.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which languages are supported for SMS payment reminders?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'BahiApp generates culturally appropriate, grammatically verified SMS reminders in English, isiZulu, and Sesotho across Friendly, Standard, and Urgent tones.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BahiApp" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="author" type="text/plain" href="/llm.txt" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;500;600&family=JetBrains+Mono:wght@400;500;600;700;800&family=Lexend:wght@400;500;600&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[#FBF8F3] text-[#13222B] antialiased">
        {children}
      </body>
    </html>
  );
}
