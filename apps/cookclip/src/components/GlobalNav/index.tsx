'use client';

import { usePathname } from 'next/navigation';
import AuthButton from '@/components/AuthButton';

export default function GlobalNav() {
  const pathname = usePathname();

  // 자체 nav가 있는 페이지에서는 전역 nav 숨김
  if (
    pathname.startsWith('/recipe/') ||
    pathname.startsWith('/saved') ||
    pathname.startsWith('/shopping') ||
    pathname.startsWith('/login')
  )
    return null;

  return (
    <nav className="fixed top-0 right-0 z-50 px-4 py-3">
      <AuthButton />
    </nav>
  );
}
