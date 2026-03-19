'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useAuthButton() {
  const { user, isLoading, signInWithGoogle, signInWithKakao, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  return {
    user,
    isLoading,
    menuOpen,
    setMenuOpen,
    signInWithGoogle,
    signInWithKakao,
    handleSignOut,
  };
}
