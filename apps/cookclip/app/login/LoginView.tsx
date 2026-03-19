'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useLoginView } from './useLoginView';

export default function LoginView() {
  const {
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
  } = useLoginView();

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* 메인과 동일한 그라디언트 헤더 */}
      <header className="bg-gradient-to-b from-[#f0e8dc] to-[#faf7f2] px-4 pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-11 h-11 bg-[#c4724a] rounded-xl flex items-center justify-center text-2xl shadow-md">
            🍳
          </div>
          <h1 className="text-[28px] font-extrabold text-[#3d2b1f] tracking-tight">
            Cook<span className="text-[#c4724a]">Clip</span>
          </h1>
        </div>
        <p className="text-[14px] text-[#7d6550] break-keep">
          유튜브 요리 영상을 <span className="text-[#c4724a] font-semibold">clip</span>하고
          <br />
          레시피와 재료를 한 번에 확인하세요
        </p>
      </header>

      {/* 로그인 카드 */}
      <main className="flex flex-col items-center px-4 py-8 pb-16">
        <div className="w-full max-w-[400px] bg-white rounded-2xl border border-[#ddd0bc] shadow-[0_4px_24px_rgba(61,43,31,0.07)] p-8">
          {signUpDone ? (
            /* ── 가입 완료 ── */
            <div className="text-center py-2">
              <p className="text-5xl mb-4">📬</p>
              <h2 className="text-[17px] font-extrabold text-[#3d2b1f] mb-2">
                이메일을 확인해주세요
              </h2>
              <p className="text-[13px] text-[#a89880] leading-relaxed break-keep">
                {email}으로 인증 링크를 보냈습니다.
                <br />
                링크를 클릭하면 자동으로 로그인됩니다.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[18px] font-extrabold text-[#3d2b1f] tracking-tight mb-1">
                {authMode === 'signin' ? '다시 오셨군요! 👋' : '환영해요! 🎉'}
              </h2>
              <p className="text-[13px] text-[#a89880] mb-6">
                {authMode === 'signin'
                  ? '로그인하고 레시피를 저장하세요'
                  : '새 계정을 만들어 레시피를 저장하세요'}
              </p>

              {/* Google */}
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-2.5 border-[1.5px] border-[#ddd0bc] hover:bg-[#f5ede0] hover:border-[#c4724a] text-[#3d2b1f] text-[14px] font-semibold py-3 rounded-[10px] transition-colors mb-5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 계속하기
              </button>

              {/* 구분선 */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#ddd0bc]" />
                <span className="text-[12px] text-[#a89880] whitespace-nowrap">또는 이메일로</span>
                <div className="flex-1 h-px bg-[#ddd0bc]" />
              </div>

              {/* 이메일 폼 */}
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#7d6550] mb-1.5">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    required
                    className="w-full border-[1.5px] border-[#ddd0bc] focus:border-[#9e7b5a] focus:ring-2 focus:ring-[#9e7b5a]/10 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#3d2b1f] placeholder:text-[#a89880] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#7d6550] mb-1.5">
                    비밀번호
                    {authMode === 'signup' && (
                      <span className="font-normal text-[#a89880]"> (6자 이상)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full border-[1.5px] border-[#ddd0bc] focus:border-[#9e7b5a] focus:ring-2 focus:ring-[#9e7b5a]/10 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#3d2b1f] placeholder:text-[#a89880] outline-none transition-colors"
                  />
                </div>

                {error && <p className="text-[12px] text-red-500 -mt-1">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#c4724a] hover:bg-[#b0623d] disabled:opacity-60 text-white font-bold text-[14px] py-3 rounded-[10px] transition-colors flex items-center justify-center gap-2 min-h-[44px] mt-1"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {authMode === 'signin' ? '이메일로 로그인' : '회원가입'}
                </button>
              </form>

              {/* 모드 전환 */}
              <p className="text-center text-[13px] text-[#a89880] mt-5">
                {authMode === 'signin' ? (
                  <>
                    계정이 없으신가요?{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="text-[#c4724a] font-bold hover:underline"
                    >
                      회원가입
                    </button>
                  </>
                ) : (
                  <>
                    이미 계정이 있으신가요?{' '}
                    <button
                      onClick={() => switchMode('signin')}
                      className="text-[#c4724a] font-bold hover:underline"
                    >
                      로그인
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>

        <Link
          href="/"
          className="mt-5 text-[13px] text-[#a89880] hover:text-[#7d6550] transition-colors"
        >
          ← 홈으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
