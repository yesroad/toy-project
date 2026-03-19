import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import '@workspace/ui/styles/globals.css';
import './globals.css';
import QueryProvider from '@/provider/QueryProvider';
import GlobalNav from '@/components/GlobalNav';
import { serverEnv } from '@/env/server';

const SITE_NAME = 'CookClip';
const SITE_DESCRIPTION = '유튜브 요리 영상 URL만 넣으면 재료와 조리 순서를 자동으로 정리해 드려요';

export function generateMetadata(): Metadata {
  const siteUrl = serverEnv.siteUrl;
  return {
    title: {
      default: `${SITE_NAME} — 유튜브 요리 영상 레시피 자동 추출`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: `${SITE_NAME} — 유튜브 요리 영상 레시피 자동 추출`,
      description: SITE_DESCRIPTION,
      url: siteUrl,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      type: 'website',
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — 유튜브 요리 영상 레시피 자동 추출`,
      description: SITE_DESCRIPTION,
      images: [`${siteUrl}/og-image.png`],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', type: 'image/x-icon' },
      ],
      apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
    },
    manifest: '/site.webmanifest',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: serverEnv.siteUrl,
    description: SITE_DESCRIPTION,
    inLanguage: 'ko',
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <QueryProvider>
          <GlobalNav />
          {children}
        </QueryProvider>
        {serverEnv.gaId && (
          <Suspense>
            <GoogleAnalytics gaId={serverEnv.gaId} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
