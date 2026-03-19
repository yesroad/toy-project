'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, ChefHat, ArrowLeft, Loader2 } from 'lucide-react';
import { useRecipeModal } from '@/components/RecipeModal/useRecipeModal';
import { Skeleton } from '@workspace/ui/components/skeleton';
import IngredientList from '@/components/RecipeModal/IngredientList';
import RecipeSteps from '@/components/RecipeModal/RecipeSteps';
import type { RecipeErrorCode } from '@/components/RecipeModal/useRecipeModal';

interface Props {
  videoId: string;
}

export default function RecipePageView({ videoId }: Props) {
  const { state } = useRecipeModal(videoId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<'ingredients' | 'steps'>('ingredients');
  const [scrollProgress, setScrollProgress] = useState(0);

  // 스크롤 진행 바
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrollspy — 레시피 데이터가 준비된 후 섹션 관찰 시작
  useEffect(() => {
    if (state.phase !== 'recipe_ready') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as 'ingredients' | 'steps');
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' },
    );

    const ingredientsEl = document.getElementById('ingredients');
    const stepsEl = document.getElementById('steps');
    if (ingredientsEl) observer.observe(ingredientsEl);
    if (stepsEl) observer.observe(stepsEl);
    return () => observer.disconnect();
  }, [state.phase]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      {/* 네비게이션 바 */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#ede3d8] px-4 py-3 flex items-center gap-3">
        {/* 스크롤 진행 바 */}
        <div
          className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-[#c4724a] to-[#e8a87c] transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#7d6550] hover:text-[#c4724a] transition-colors text-[14px] font-medium"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Link>
        <span className="text-[#ddd0bc]">|</span>
        <span className="text-[14px] font-bold text-[#3d2b1f]">🍳 CookClip</span>
      </nav>

      <main className="max-w-4xl mx-auto pb-24">
        {state.phase === 'loading_detail' && <PageSkeleton />}

        {state.phase === 'detail_ready' && <PageDetailSkeleton detail={state.detail} />}

        {state.phase === 'error' && (
          <PageErrorMessage
            errorCode={state.errorCode}
            message={state.message}
            status={state.status}
          />
        )}

        {state.phase === 'recipe_ready' && (
          <>
            {/* 히어로 영역 */}
            <div className="relative aspect-video overflow-hidden bg-black">
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={state.recipe.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <>
                  <Image
                    src={state.recipe.thumbnail}
                    alt={state.recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 896px) 100vw, 896px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <button
                    onClick={() => setIsPlaying(true)}
                    aria-label="영상 재생"
                    className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-black/55 group-hover:bg-[#c4724a]/90 flex items-center justify-center transition-colors">
                      <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h1 className="text-[18px] md:text-[22px] font-bold text-white leading-snug break-keep [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                      {state.recipe.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-[13px] text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                        📺 {state.recipe.channelName}
                      </p>
                      {state.recipe.cached && (
                        <span className="text-[11px] font-semibold bg-[#c4724a]/80 text-white px-2 py-0.5 rounded-full">
                          ⚡ 즉시 로드
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Scrollspy 네비 — 탭 대신 앵커 링크 */}
            <div className="sticky top-[46px] z-10 bg-white border-b-2 border-[#ede3d8]">
              <div className="flex overflow-hidden">
                <button
                  onClick={() => scrollToSection('ingredients')}
                  className={`flex items-center gap-1.5 px-5 py-3.5 text-[14px] font-semibold whitespace-nowrap border-b-2 -mb-0.5 transition-colors ${
                    activeSection === 'ingredients'
                      ? 'text-[#c4724a] border-[#c4724a]'
                      : 'text-[#7d6550] border-transparent hover:text-[#3d2b1f]'
                  }`}
                >
                  🥕 재료
                  <span className="text-[12px] font-normal text-[#a89880]">
                    ({state.recipe.ingredients.length})
                  </span>
                </button>
                <button
                  onClick={() => scrollToSection('steps')}
                  className={`flex items-center gap-1.5 px-5 py-3.5 text-[14px] font-semibold whitespace-nowrap border-b-2 -mb-0.5 transition-colors ${
                    activeSection === 'steps'
                      ? 'text-[#c4724a] border-[#c4724a]'
                      : 'text-[#7d6550] border-transparent hover:text-[#3d2b1f]'
                  }`}
                >
                  📋 조리방법
                  <span className="text-[12px] font-normal text-[#a89880]">
                    ({state.recipe.steps.length}단계)
                  </span>
                </button>
              </div>
            </div>

            {/* 아티클 바디 — 모바일: 단일 컬럼 / 데스크톱: 2컬럼 */}
            <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start md:px-6 md:py-8">

              {/* 재료 섹션 */}
              <section id="ingredients" className="px-4 pt-6 pb-8 md:p-0 md:sticky md:top-[113px] md:self-start">
                {/* 메타 배지 */}
                {(state.recipe.cookingTime || state.recipe.servings || state.recipe.calories) && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {state.recipe.cookingTime && (
                      <span className="text-[12px] text-[#7d6550] bg-[#f5ede0] px-3 py-1.5 rounded-full font-medium">
                        ⏱ {state.recipe.cookingTime}분
                      </span>
                    )}
                    {state.recipe.servings && (
                      <span className="text-[12px] text-[#7d6550] bg-[#f5ede0] px-3 py-1.5 rounded-full font-medium">
                        👤 {state.recipe.servings}
                      </span>
                    )}
                    {state.recipe.calories && (
                      <span className="text-[12px] text-[#7d6550] bg-[#f5ede0] px-3 py-1.5 rounded-full font-medium">
                        🔥 {state.recipe.calories}kcal
                      </span>
                    )}
                  </div>
                )}

                {/* 섹션 헤딩 */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#ede3d8]">
                  <span className="text-[18px]">🥕</span>
                  <h2 className="text-[17px] font-extrabold text-[#3d2b1f] tracking-tight">재료</h2>
                  <span className="text-[12px] font-semibold text-[#a89880] bg-[#ede3d8] px-2 py-0.5 rounded-full ml-1">
                    {state.recipe.ingredients.length}가지
                  </span>
                </div>

                {/* 쿠팡 고지 — 재료 칩 목록 위 */}
                {state.recipe.coupangLinks && Object.keys(state.recipe.coupangLinks).length > 0 && (
                  <p className="text-[11px] text-[#9d8570] mb-3 break-keep leading-relaxed bg-[#f5ede0] rounded-lg px-3 py-2">
                    🛒 재료 구매 링크는 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의 수수료를 제공받습니다.
                  </p>
                )}

                <IngredientList
                  ingredients={state.recipe.ingredients}
                  coupangLinks={state.recipe.coupangLinks}
                />

                {/* 핵심 팁 */}
                {state.recipe.tips && state.recipe.tips.length > 0 && (
                  <div className="mt-6 bg-[#fffbf5] border border-[#ede3d8] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm">💡</span>
                      <span className="text-[14px] font-bold text-[#3d2b1f]">핵심 팁</span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {state.recipe.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-[#c4724a] font-bold text-[13px] shrink-0 mt-0.5">
                            {i + 1}.
                          </span>
                          <p className="text-[13px] text-[#5a3e2e] leading-relaxed break-keep">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 유의사항 */}
                {state.recipe.notes && state.recipe.notes.length > 0 && (
                  <div className="mt-4 bg-[#fdf8f4] border border-[#ede3d8] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">⚠️</span>
                      <span className="text-[13px] font-bold text-[#7d6550]">유의사항</span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {state.recipe.notes.map((note, i) => (
                        <li key={i} className="text-[12px] text-[#9d8570] leading-relaxed break-keep">
                          • {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* 조리방법 섹션 — 모바일에서 두꺼운 border-top으로 섹션 구분 */}
              <section
                id="steps"
                className="border-t-8 border-[#f0e8dc] md:border-0 px-4 pt-6 pb-8 md:p-0"
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#ede3d8]">
                  <span className="text-[18px]">📋</span>
                  <h2 className="text-[17px] font-extrabold text-[#3d2b1f] tracking-tight">조리방법</h2>
                  <span className="text-[12px] font-semibold text-[#a89880] bg-[#ede3d8] px-2 py-0.5 rounded-full ml-1">
                    {state.recipe.steps.length}단계
                  </span>
                </div>

                <RecipeSteps steps={state.recipe.steps} stepDetails={state.recipe.stepDetails} />
              </section>
            </div>

            {/* Floating CTA */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white/95 backdrop-blur border-t border-[#ede3d8]">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setIsPlaying(true)}
                  disabled={isPlaying}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#3d2b1f] hover:bg-[#2d1f16]
                             disabled:bg-[#c4a88a] text-white font-bold text-[15px] py-3.5 rounded-xl
                             transition-colors cursor-pointer disabled:cursor-default"
                >
                  <ChefHat size={18} />
                  요리 시작하기
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function PageSkeleton() {
  return (
    <>
      <div className="aspect-video bg-[#f5ede0] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#c4724a]/60" />
      </div>
      {/* Scrollspy 스켈레톤 */}
      <div className="bg-white border-b-2 border-[#ede3d8] px-4 py-3.5 flex gap-6">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <div className="p-6 space-y-3">
        <div className="flex flex-wrap gap-2 mb-1">
          {[64, 72, 80].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
        <Skeleton className="h-5 w-24" />
        <div className="flex flex-wrap gap-2 pt-1">
          {[90, 75, 105, 80, 95, 70].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </>
  );
}

function PageDetailSkeleton({
  detail,
}: {
  detail: { title: string; thumbnail: string; channelName: string };
}) {
  return (
    <>
      <div className="relative aspect-video overflow-hidden bg-[#f5ede0]">
        <Image
          src={detail.thumbnail}
          alt={detail.title}
          fill
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-[18px] font-bold text-white leading-snug break-keep [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            {detail.title}
          </h1>
          <p className="text-[13px] text-white/90 mt-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
            📺 {detail.channelName}
          </p>
        </div>
      </div>
      {/* Scrollspy 스켈레톤 */}
      <div className="bg-white border-b-2 border-[#ede3d8] px-4 py-3.5 flex gap-6">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-[#c4724a] mb-2">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[13px] font-semibold text-[#7d6550]">레시피 분석 중...</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[90, 75, 105, 80, 95, 70].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </>
  );
}

const PAGE_ERROR_CONFIG: Record<RecipeErrorCode, { emoji: string; title: string; desc: string }> = {
  CAPTION_UNAVAILABLE: {
    emoji: '🎬',
    title: '자막을 가져올 수 없는 영상이에요',
    desc: '자막이 없거나 비공개 영상일 수 있습니다',
  },
  CAPTION_EMPTY: {
    emoji: '🎬',
    title: '자막 내용이 없는 영상이에요',
    desc: '영상에 자막 트랙은 있지만 내용이 비어있습니다',
  },
  INSUFFICIENT_INGREDIENTS: {
    emoji: '🥗',
    title: '레시피 정보가 부족한 영상이에요',
    desc: '요리 레시피가 아니거나 재료 설명이 너무 짧습니다',
  },
  AI_ANALYSIS_FAILED: {
    emoji: '🤖',
    title: 'AI 분석에 실패했습니다',
    desc: '잠시 후 다시 시도해주세요',
  },
  SERVER_ERROR: {
    emoji: '⚠️',
    title: '서버 오류가 발생했습니다',
    desc: '잠시 후 다시 시도해주세요',
  },
  NETWORK_ERROR: {
    emoji: '📡',
    title: '연결이 끊겼습니다',
    desc: '네트워크 상태를 확인하고 다시 시도해주세요',
  },
};

function PageErrorMessage({
  errorCode,
  message,
  status,
}: {
  errorCode: RecipeErrorCode;
  message: string;
  status: number;
}) {
  const config = PAGE_ERROR_CONFIG[errorCode];
  return (
    <div className="p-16 text-center">
      <p className="text-5xl mb-4">{config.emoji}</p>
      <p className="text-[16px] font-semibold text-[#3d2b1f]">{config.title}</p>
      <p className="text-[14px] text-[#7d6550] mt-2">{config.desc}</p>
      {process.env.NODE_ENV === 'development' && (
        <p className="text-[11px] text-[#bbb] mt-4 font-mono break-all">
          [{errorCode}] {status !== 0 ? `HTTP ${status}` : 'network'} — {message}
        </p>
      )}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mt-6 text-[14px] text-[#c4724a] font-semibold hover:underline"
      >
        <ArrowLeft size={14} />
        홈으로 돌아가기
      </Link>
    </div>
  );
}
