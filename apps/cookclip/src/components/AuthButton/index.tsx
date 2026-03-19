'use client';

import { LogIn, LogOut, User, ChevronDown, X, Loader2 } from 'lucide-react';
import { useAuthButton } from './useAuthButton';

export default function AuthButton() {
  const {
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
  } = useAuthButton();

  if (isLoading) return null;

  /* ── 로그아웃 상태 ── */
  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => setPanelOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#7d6550] hover:text-[#c4724a] transition-colors"
        >
          <LogIn size={15} />
          로그인
        </button>

        {panelOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={closePanel} />
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#ddd0bc] shadow-xl z-20 p-4">
              {/* 닫기 */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-bold text-[#3d2b1f]">
                  {authMode === 'signin' ? '로그인' : '회원가입'}
                </span>
                <button onClick={closePanel} className="text-[#a89880] hover:text-[#3d2b1f]">
                  <X size={16} />
                </button>
              </div>

              {signUpDone ? (
                /* 가입 완료 안내 */
                <div className="text-center py-4">
                  <p className="text-2xl mb-2">📬</p>
                  <p className="text-[13px] font-semibold text-[#3d2b1f]">이메일을 확인해주세요</p>
                  <p className="text-[12px] text-[#7d6550] mt-1">
                    {email}으로 인증 링크를 보냈습니다
                  </p>
                </div>
              ) : (
                <>
                  {/* 이메일 폼 */}
                  <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일"
                      required
                      className="w-full border border-[#ddd0bc] rounded-lg px-3 py-2 text-[13px] text-[#3d2b1f] placeholder:text-[#a89880] outline-none focus:border-[#9e7b5a] focus:ring-2 focus:ring-[#9e7b5a]/10"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호"
                      required
                      minLength={6}
                      className="w-full border border-[#ddd0bc] rounded-lg px-3 py-2 text-[13px] text-[#3d2b1f] placeholder:text-[#a89880] outline-none focus:border-[#9e7b5a] focus:ring-2 focus:ring-[#9e7b5a]/10"
                    />
                    {error && <p className="text-[11px] text-red-500">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#c4724a] hover:bg-[#b5623d] disabled:opacity-60 text-white font-semibold text-[13px] py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {submitting && <Loader2 size={13} className="animate-spin" />}
                      {authMode === 'signin' ? '이메일로 로그인' : '회원가입'}
                    </button>
                  </form>

                  {/* 구분선 */}
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-[#ede3d8]" />
                    <span className="text-[11px] text-[#a89880]">또는</span>
                    <div className="flex-1 h-px bg-[#ede3d8]" />
                  </div>

                  {/* Google 로그인 */}
                  <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-2 border border-[#ddd0bc] hover:bg-[#f5ede0] text-[#3d2b1f] text-[13px] font-medium py-2.5 rounded-lg transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google로 로그인
                  </button>

                  {/* 모드 전환 */}
                  <p className="text-center text-[12px] text-[#a89880] mt-3">
                    {authMode === 'signin' ? (
                      <>
                        계정이 없으신가요?{' '}
                        <button
                          onClick={() => { setAuthMode('signup'); }}
                          className="text-[#c4724a] font-semibold hover:underline"
                        >
                          회원가입
                        </button>
                      </>
                    ) : (
                      <>
                        이미 계정이 있으신가요?{' '}
                        <button
                          onClick={() => { setAuthMode('signin'); }}
                          className="text-[#c4724a] font-semibold hover:underline"
                        >
                          로그인
                        </button>
                      </>
                    )}
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── 로그인 상태 ── */
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
