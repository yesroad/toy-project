'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, ChefHat, ArrowLeft, Loader2 } from 'lucide-react';
import { useRecipeModal } from '@/components/RecipeModal/useRecipeModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs';
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

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      {/* 네비게이션 바 */}
      <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#ede3d8] px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#7d6550] hover:text-[#c4724a] transition-colors text-[14px] font-medium"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Link>
        <span className="text-[#ddd0bc]">|</span>
        <span className="text-[14px] font-bold text-[#3d2b1f]">🍳 Recipick</span>
      </nav>

      <main className="max-w-2xl mx-auto pb-24">
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
                    sizes="(max-width: 672px) 100vw, 672px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0" />
                  <button
                    onClick={() => setIsPlaying(true)}
                    aria-label="영상 재생"
                    className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-black/60 group-hover:bg-[#c4724a]/90 flex items-center justify-center transition-colors">
                      <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h1 className="text-[20px] font-bold text-white leading-snug break-keep [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                      {state.recipe.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
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

            {/* 탭 바디 */}
            <Tabs defaultValue="ingredients" className="flex flex-col">
              <div className="px-6 pt-4">
                <TabsList className="w-full bg-[#f5ede0] rounded-xl h-10 p-1">
                  <TabsTrigger
                    value="ingredients"
                    className="flex-1 text-[13px] font-semibold text-[#7d6550]
                               data-[state=active]:bg-white data-[state=active]:text-[#c4724a]
                               data-[state=active]:shadow-sm rounded-lg transition-all"
                  >
                    🥕 재료 ({state.recipe.ingredients.length}가지)
                  </TabsTrigger>
                  <TabsTrigger
                    value="steps"
                    className="flex-1 text-[13px] font-semibold text-[#7d6550]
                               data-[state=active]:bg-white data-[state=active]:text-[#c4724a]
                               data-[state=active]:shadow-sm rounded-lg transition-all"
                  >
                    📋 조리방법 ({state.recipe.steps.length}단계)
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="ingredients" className="px-6 py-4">
                {/* 메타 정보 바 */}
                {(state.recipe.cookingTime || state.recipe.servings || state.recipe.calories) && (
                  <div className="flex flex-wrap gap-2 mb-4">
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
                {state.recipe.coupangLinks && Object.keys(state.recipe.coupangLinks).length > 0 && (
                  <p className="text-[11px] text-[#9d8570] mb-3 break-keep leading-relaxed">
                    * 재료 구매 링크는 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의 수수료를
                    제공받습니다.
                  </p>
                )}
                <IngredientList
                  ingredients={state.recipe.ingredients}
                  coupangLinks={state.recipe.coupangLinks}
                />

                {/* 핵심 팁 */}
                {state.recipe.tips && state.recipe.tips.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-[#fdf0e6] flex items-center justify-center text-sm">
                        💡
                      </div>
                      <span className="text-[14px] font-bold text-[#3d2b1f]">핵심 팁</span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {state.recipe.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-[#c4724a] font-bold text-[13px] shrink-0 mt-0.5">
                            {i + 1}.
                          </span>
                          <p className="text-[13px] text-[#5a3e2e] leading-relaxed break-keep">
                            {tip}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 유의사항 */}
                {state.recipe.notes && state.recipe.notes.length > 0 && (
                  <div className="mt-5 bg-[#fdf8f4] border border-[#ede3d8] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">⚠️</span>
                      <span className="text-[13px] font-bold text-[#7d6550]">유의사항</span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {state.recipe.notes.map((note, i) => (
                        <li
                          key={i}
                          className="text-[12px] text-[#9d8570] leading-relaxed break-keep"
                        >
                          • {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="steps" className="px-6 py-4">
                <RecipeSteps steps={state.recipe.steps} stepDetails={state.recipe.stepDetails} />
              </TabsContent>
            </Tabs>

            {/* Floating CTA */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white/95 backdrop-blur border-t border-[#ede3d8]">
              <div className="max-w-2xl mx-auto">
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
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex flex-wrap gap-2 pt-2">
          {[90, 75, 105, 80, 95].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
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
      <div className="relative aspect-[16/7] overflow-hidden bg-[#f5ede0]">
        <Image
          src={detail.thumbnail}
          alt={detail.title}
          fill
          className="object-cover"
          sizes="(max-width: 672px) 100vw, 672px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-[20px] font-bold text-white leading-snug break-keep [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            {detail.title}
          </h1>
          <p className="text-[13px] text-white/90 mt-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
            📺 {detail.channelName}
          </p>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex items-center gap-2 text-[#c4724a]">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[13px] font-semibold text-[#7d6550]">레시피 분석 중...</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {[90, 75, 105, 80, 95].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
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
