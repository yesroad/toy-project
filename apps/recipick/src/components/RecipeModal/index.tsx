'use client';

import Image from 'next/image';
import { useRecipeQuery } from '@/queries/recipe';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@workspace/ui/components/dialog';
import IngredientList from './IngredientList';
import RecipeSteps from './RecipeSteps';

interface RecipeModalProps {
  videoId: string | null;
  onClose: () => void;
}

export default function RecipeModal({ videoId, onClose }: RecipeModalProps) {
  const { data: recipe, isLoading, isError } = useRecipeQuery(videoId);

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

        {isLoading && <ModalSkeleton />}

        {isError && (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">😅</p>
            <p className="text-[15px] font-semibold text-[#3d2b1f]">레시피를 불러올 수 없습니다</p>
            <p className="text-[13px] text-[#7d6550] mt-1">
              이 영상에는 자막이 없거나 분석에 실패했습니다
            </p>
          </div>
        )}

        {recipe && (
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
                <p className="text-[13px] text-white/75 mt-1">📺 {recipe.channelName}</p>
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
                <IngredientList
                  ingredients={recipe.ingredients}
                  coupangLinks={recipe.coupangLinks}
                />
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
        )}
      </DialogContent>
    </Dialog>
  );
}

function ModalSkeleton() {
  return (
    <>
      <Skeleton className="aspect-[16/7] w-full rounded-none" />
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
