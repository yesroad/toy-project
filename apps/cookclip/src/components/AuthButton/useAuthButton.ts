'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'signin' | 'signup';

export function useAuthButton() {
  const { user, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } =
    useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);

  const closePanel = () => {
    setPanelOpen(false);
    setError('');
    setEmail('');
    setPassword('');
    setSignUpDone(false);
    setAuthMode('signin');
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (authMode === 'signin') {
      const err = await signInWithEmail(email, password);
      if (err) setError('이메일 또는 비밀번호가 올바르지 않습니다');
      else closePanel();
    } else {
      const err = await signUpWithEmail(email, password);
      if (err) setError('회원가입에 실패했습니다. 다시 시도해주세요');
      else setSignUpDone(true);
    }

    setSubmitting(false);
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  return {
    user,
    isLoading,
    panelOpen,
    setPanelOpen,
    menuOpen,
    setMenuOpen,
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    signUpDone,
    signInWithGoogle,
    handleEmailSubmit,
    handleSignOut,
    closePanel,
  };
}
