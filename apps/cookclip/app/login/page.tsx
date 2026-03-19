import type { Metadata } from 'next';
import LoginView from './LoginView';

export const metadata: Metadata = {
  title: '로그인',
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginView />;
}
