'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Play, ChefHat } from 'lucide-react';
import { useRecipeModal } from './useRecipeModal';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@workspace/ui/components/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs';
import IngredientList from './IngredientList';
import RecipeSteps from './RecipeSteps';

interface RecipeModalProps {
  videoId: string | null;
  onClose: () => void;
}

export default function RecipeModal({ videoId, onClose }: RecipeModalProps) {
  const { state } = useRecipeModal(videoId);

  return (
    <Dialog
      open={!!videoId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="p-0 max-w-2xl overflow-hidden rounded-2xl border-[#ddd0bc]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">레시피</DialogTitle>

        {state.phase === 'loading_detail' && <ModalSkeleton />}

        {state.phase === 'detail_ready' && (
          <VideoDetailSkeleton detail={state.detail} onClose={onClose} />
        )}

        {state.phase === 'error' && (
          <ErrorMessage message={state.message} status={state.status} errorCode={state.errorCode} />
        )}

        {state.phase === 'recipe_ready' && (
          <RecipeModalContent recipe={state.recipe} videoId={videoId} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface RecipeModalContentProps {
  recipe: {
    title: string;
    thumbnail: string;
    channelName: string;
    cached: boolean;
    ingredients: { name: string; amount: string }[];
    steps: string[];
    coupangLinks?: Record<string, string>;
  };
  videoId: string | null;
  onClose: () => void;
}

function RecipeModalContent({ recipe, videoId, onClose }: RecipeModalContentProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* 히어로 영역 */}
      <div className="relative aspect-video overflow-hidden bg-black shrink-0">
        {isPlaying && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={recipe.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            <Image
              src={recipe.thumbnail}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0" />
            {/* 재생 버튼 */}
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
              <h2 className="text-[18px] font-bold text-white leading-snug break-keep [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                {recipe.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[13px] text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                  📺 {recipe.channelName}
                </p>
                {recipe.cached && (
                  <span className="text-[11px] font-semibold bg-[#c4724a]/80 text-white px-2 py-0.5 rounded-full">
                    ⚡ 즉시 로드
                  </span>
                )}
              </div>
            </div>
          </>
        )}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75
                     text-white flex items-center justify-center transition-colors cursor-pointer text-base z-10"
        >
          ✕
        </button>
      </div>

      {/* 탭 바디 */}
      <Tabs defaultValue="ingredients" className="flex flex-col flex-1 min-h-0">
        <div className="px-6 pt-4 shrink-0">
          <TabsList className="w-full bg-[#f5ede0] rounded-xl h-10 p-1">
            <TabsTrigger
              value="ingredients"
              className="flex-1 text-[13px] font-semibold text-[#7d6550]
                         data-[state=active]:bg-white data-[state=active]:text-[#c4724a]
                         data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              🥕 재료 ({recipe.ingredients.length}가지)
            </TabsTrigger>
            <TabsTrigger
              value="steps"
              className="flex-1 text-[13px] font-semibold text-[#7d6550]
                         data-[state=active]:bg-white data-[state=active]:text-[#c4724a]
                         data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              📋 조리방법 ({recipe.steps.length}단계)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ingredients" className="flex-1 overflow-y-auto px-6 py-4">
          {recipe.coupangLinks && Object.keys(recipe.coupangLinks).length > 0 && (
            <p className="text-[11px] text-[#9d8570] mb-3 break-keep leading-relaxed">
              * 재료 구매 링크는 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의 수수료를
              제공받습니다.
            </p>
          )}
          <IngredientList ingredients={recipe.ingredients} coupangLinks={recipe.coupangLinks} />
        </TabsContent>

        <TabsContent value="steps" className="flex-1 overflow-y-auto px-6 py-4">
          <RecipeSteps steps={recipe.steps} />
        </TabsContent>
      </Tabs>

      {/* Floating CTA */}
      <div className="shrink-0 px-5 py-4 border-t border-[#ede3d8] bg-white">
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
  );
}

// video_detail 이벤트 수신 후 표시: 실제 썸네일/제목 + 재료 스켈레톤
// 사용자가 "맞는 영상"임을 1-2초 내 확인 가능
function VideoDetailSkeleton({
  detail,
  onClose,
}: {
  detail: { title: string; thumbnail: string; channelName: string };
  onClose: () => void;
}) {
  return (
    <>
      <div className="relative aspect-[16/7] overflow-hidden bg-[#f5ede0]">
        <Image
          src={detail.thumbnail}
          alt={detail.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 672px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-[18px] font-bold text-white leading-snug break-keep [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            {detail.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[13px] text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
              📺 {detail.channelName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75
                     text-white flex items-center justify-center transition-colors cursor-pointer text-base"
        >
          ✕
        </button>
      </div>
      <div className="p-6 space-y-3">
        {/* 탭 스켈레톤 */}
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex items-center gap-2 mt-2 text-[#c4724a]">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[13px] font-semibold text-[#7d6550]">레시피 분석 중...</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {[90, 75, 105, 80, 95].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </>
  );
}

import type { RecipeErrorCode } from './useRecipeModal';

const ERROR_CONFIG: Record<RecipeErrorCode, { emoji: string; title: string; desc: string }> = {
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

function ErrorMessage({
  status,
  message,
  errorCode,
}: {
  status: number;
  message: string;
  errorCode: RecipeErrorCode;
}) {
  const config = ERROR_CONFIG[errorCode];
  return (
    <div className="p-10 text-center">
      <p className="text-4xl mb-3">{config.emoji}</p>
      <p className="text-[15px] font-semibold text-[#3d2b1f]">{config.title}</p>
      <p className="text-[13px] text-[#7d6550] mt-1">{config.desc}</p>
      {process.env.NODE_ENV === 'development' && (
        <p className="text-[11px] text-[#bbb] mt-3 font-mono break-all">
          [{errorCode}] {status !== 0 ? `HTTP ${status}` : 'network'} — {message}
        </p>
      )}
    </div>
  );
}

function ModalSkeleton() {
  return (
    <>
      <div className="relative aspect-[16/7] w-full bg-[#f5ede0] flex items-center justify-center">
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
