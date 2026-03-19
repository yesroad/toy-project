'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'signin' | 'signup';

export function useLoginView() {
  const router = useRouter();
  const { user, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);

  // 이미 로그인된 상태면 홈으로
  useEffect(() => {
    if (!isLoading && user) router.replace('/');
  }, [user, isLoading, router]);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (authMode === 'signin') {
      const err = await signInWithEmail(email, password);
      if (err) setError('이메일 또는 비밀번호가 올바르지 않습니다');
      else router.push('/');
    } else {
      const err = await signUpWithEmail(email, password);
      if (err) setError('회원가입에 실패했습니다. 다시 시도해주세요');
      else setSignUpDone(true);
    }

    setSubmitting(false);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setEmail('');
    setPassword('');
  };

  return {
    authMode,
    switchMode,
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    signUpDone,
    signInWithGoogle,
    handleEmailSubmit,
  };
}
