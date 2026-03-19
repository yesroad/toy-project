'use client';

import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { useCookingMode } from './useCookingMode';
import type { RecipeStep } from '@/types/api/routeApi/response';

interface CookingModeViewProps {
  videoId: string;
  title: string;
  steps: string[];
  stepDetails?: RecipeStep[];
}

export default function CookingModeView({
  videoId,
  title,
  steps,
  stepDetails,
}: CookingModeViewProps) {
  const {
    currentIdx,
    currentStep,
    currentDetail,
    isFirst,
    isLast,
    totalSteps,
    timerSec,
    timerRunning,
    toggleTimer,
    goNext,
    goPrev,
    formatTime,
  } = useCookingMode({ steps, stepDetails });

  return (
    <div className="fixed inset-0 bg-[#1a1008] flex flex-col select-none">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
        <span className="text-white/70 text-[13px] font-medium truncate max-w-[200px]">
          {title}
        </span>
        <Link
          href={`/recipe/${videoId}`}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={18} className="text-white" />
        </Link>
      </div>

      {/* 진행 바 */}
      <div className="flex gap-1 px-5 py-3">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i < currentIdx ? 'bg-[#c4724a]' : i === currentIdx ? 'bg-[#e8a87c]' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* 단계 표시 */}
      <div className="px-5 pb-2">
        <span className="text-[#c4724a] text-[13px] font-bold">
          {currentIdx + 1} / {totalSteps}단계
        </span>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <p className="text-white text-[20px] leading-relaxed font-medium break-keep mt-2">
          {currentStep}
        </p>

        {/* 이 단계 사용 재료 */}
        {currentDetail?.ingredients && currentDetail.ingredients.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {currentDetail.ingredients.map((ing, i) => (
              <span
                key={i}
                className="bg-white/10 text-white/80 text-[13px] px-3 py-1.5 rounded-full"
              >
                {ing}
              </span>
            ))}
          </div>
        )}

        {/* 타이머 */}
        {timerSec !== null && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <span
              className={`text-[48px] font-bold tabular-nums ${timerSec === 0 ? 'text-[#c4724a]' : 'text-white'}`}
            >
              {formatTime(timerSec)}
            </span>
            <button
              onClick={toggleTimer}
              className="flex items-center gap-2 bg-[#c4724a] hover:bg-[#b5623d] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {timerSec === 0 ? (
                <>
                  <RotateCcw size={16} /> 다시 시작
                </>
              ) : timerRunning ? (
                <>
                  <Pause size={16} /> 일시정지
                </>
              ) : (
                <>
                  <Play size={16} /> 타이머 시작
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 하단 네비 */}
      <div className="flex items-center justify-between px-5 pb-8 pt-4 border-t border-white/10">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="flex items-center gap-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors text-[15px] font-medium"
        >
          <ChevronLeft size={20} />
          이전
        </button>
        {isLast ? (
          <Link
            href={`/recipe/${videoId}`}
            className="bg-[#c4724a] text-white font-bold px-8 py-3 rounded-xl text-[15px] hover:bg-[#b5623d] transition-colors"
          >
            완료 🎉
          </Link>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-2 text-white hover:text-[#e8a87c] transition-colors text-[15px] font-bold"
          >
            다음
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
