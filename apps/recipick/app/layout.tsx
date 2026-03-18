import type { Metadata } from 'next';
import '@workspace/ui/globals.css';
import './globals.css';
import QueryProvider from '@/provider/QueryProvider';

export const metadata: Metadata = {
  title: 'Recipick',
  description: '유튜브 요리 영상에서 레시피를 자동 추출하는 서비스',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
