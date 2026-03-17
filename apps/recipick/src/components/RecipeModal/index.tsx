'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useRecipeModal } from './useRecipeModal';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@workspace/ui/components/dialog';
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

        {state.phase === 'error' && <ErrorMessage message={state.message} status={state.status} />}

        {state.phase === 'recipe_ready' && (
          <RecipeModalContent recipe={state.recipe} onClose={onClose} />
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
  onClose: () => void;
}

function RecipeModalContent({ recipe, onClose }: RecipeModalContentProps) {
  const isShorts = recipe.title.toLowerCase().includes('#shorts') || recipe.title.includes('#쇼츠');

  return (
    <>
      {/* 히어로 썸네일 */}
      <div className="relative aspect-[16/7] overflow-hidden bg-[#f5ede0]">
        <Image
          src={recipe.thumbnail}
          alt={recipe.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 672px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-[18px] font-bold text-white leading-snug break-keep">
            {recipe.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[13px] text-white/75">📺 {recipe.channelName}</p>
            {recipe.cached && (
              <span className="text-[11px] font-semibold bg-[#c4724a]/80 text-white px-2 py-0.5 rounded-full">
                ⚡ 즉시 로드
              </span>
            )}
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

      {/* 바디 */}
      <div className="p-6 max-h-[55vh] overflow-y-auto">
        {/* 숏츠 안내 */}
        {isShorts && (
          <div className="flex items-start gap-2 bg-[#f5ede0] rounded-lg px-3 py-2.5 mb-5 text-[12px] text-[#7d6550] break-keep leading-relaxed">
            <span className="shrink-0">📱</span>
            <span>숏츠 영상은 특성상 레시피와 재료 정보가 정확히 정리되지 않을 수 있습니다.</span>
          </div>
        )}

        {/* 재료 */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#f5ede0] flex items-center justify-center text-base">
              🥕
            </div>
            <span className="text-[15px] font-bold text-[#3d2b1f]">재료</span>
            <span className="ml-auto text-xs text-[#7d6550] bg-[#f5ede0] px-2 py-0.5 rounded-full">
              {recipe.ingredients.length}가지
            </span>
          </div>
          {recipe.coupangLinks && Object.keys(recipe.coupangLinks).length > 0 && (
            <p className="text-[11px] text-[#9d8570] mb-3 break-keep leading-relaxed">
              * 재료 구매 링크는 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의 수수료를
              제공받습니다.
            </p>
          )}
          <IngredientList ingredients={recipe.ingredients} coupangLinks={recipe.coupangLinks} />
        </div>

        <div className="h-px bg-[#ddd0bc] mb-7" />

        {/* 조리 단계 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#f5ede0] flex items-center justify-center text-base">
              📋
            </div>
            <span className="text-[15px] font-bold text-[#3d2b1f]">조리 방법</span>
            <span className="ml-auto text-xs text-[#7d6550] bg-[#f5ede0] px-2 py-0.5 rounded-full">
              {recipe.steps.length}단계
            </span>
          </div>
          <RecipeSteps steps={recipe.steps} />
        </div>
      </div>
    </>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-[18px] font-bold text-white leading-snug break-keep">
            {detail.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[13px] text-white/75">📺 {detail.channelName}</p>
            <span className="text-[11px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" />
              레시피 분석 중
            </span>
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
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex flex-wrap gap-2 pt-2">
          {[90, 75, 105, 80, 95].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </>
  );
}

const ERROR_CONFIG: Record<number, { emoji: string; title: string; desc: string }> = {
  422: {
    emoji: '🎬',
    title: '레시피 정보가 없는 영상이에요',
    desc: '자막이 없거나 레시피 내용이 부족한 영상입니다',
  },
  503: {
    emoji: '🤖',
    title: 'AI 분석에 실패했습니다',
    desc: '잠시 후 다시 시도해주세요',
  },
  500: {
    emoji: '⚠️',
    title: '서버 오류가 발생했습니다',
    desc: '잠시 후 다시 시도해주세요',
  },
  0: {
    emoji: '📡',
    title: '연결이 끊겼습니다',
    desc: '네트워크 상태를 확인하고 다시 시도해주세요',
  },
};

const DEFAULT_ERROR = {
  emoji: '😅',
  title: '레시피를 불러올 수 없습니다',
  desc: '알 수 없는 오류가 발생했습니다',
};

function ErrorMessage({ status, message }: { status: number; message: string }) {
  const config = ERROR_CONFIG[status] ?? DEFAULT_ERROR;
  return (
    <div className="p-10 text-center">
      <p className="text-4xl mb-3">{config.emoji}</p>
      <p className="text-[15px] font-semibold text-[#3d2b1f]">{config.title}</p>
      <p className="text-[13px] text-[#7d6550] mt-1">{config.desc}</p>
      {process.env.NODE_ENV === 'development' && (
        <p className="text-[11px] text-[#bbb] mt-3 font-mono">
          {status !== 0 ? `HTTP ${status}` : 'network'} — {message}
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
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex flex-wrap gap-2 pt-2">
          {[90, 75, 105, 80, 95].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </>
  );
}
