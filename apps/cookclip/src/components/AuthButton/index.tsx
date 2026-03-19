'use client';

import { LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthButton } from './useAuthButton';

export default function AuthButton() {
  const {
    user,
    isLoading,
    menuOpen,
    setMenuOpen,
    signInWithGoogle,
    signInWithKakao,
    handleSignOut,
  } = useAuthButton();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#7d6550] hover:text-[#c4724a] transition-colors"
        >
          <LogIn size={15} />
          로그인
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#ddd0bc] shadow-lg z-20 overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signInWithGoogle();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#3d2b1f] hover:bg-[#f5ede0] transition-colors"
              >
                <span className="text-base">G</span>
                Google로 로그인
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signInWithKakao();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#3d2b1f] hover:bg-[#f5ede0] transition-colors border-t border-[#f0e8dc]"
              >
                <span className="text-base">💬</span>
                카카오로 로그인
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[#7d6550] hover:text-[#c4724a] transition-colors"
      >
        <User size={15} />
        <span className="max-w-[80px] truncate">{user.email?.split('@')[0]}</span>
        <ChevronDown size={12} />
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#ddd0bc] shadow-lg z-20 overflow-hidden">
            <a
              href="/saved"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#3d2b1f] hover:bg-[#f5ede0] transition-colors"
            >
              ❤️ 나의 레시피
            </a>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#7d6550] hover:bg-[#f5ede0] transition-colors border-t border-[#f0e8dc]"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
