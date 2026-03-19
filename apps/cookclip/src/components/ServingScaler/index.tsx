'use client';

import { Minus, Plus } from 'lucide-react';

interface ServingScalerProps {
  currentServings: number;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}

export default function ServingScaler({
  currentServings,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: ServingScalerProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onDecrease}
        disabled={!canDecrease}
        className="w-6 h-6 rounded-full border border-[#ddd0bc] flex items-center justify-center
                   text-[#7d6550] hover:border-[#c4724a] hover:text-[#c4724a]
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="인분 줄이기"
      >
        <Minus size={11} />
      </button>
      <span className="text-[12px] font-semibold text-[#3d2b1f] min-w-[42px] text-center">
        {currentServings}인분
      </span>
      <button
        onClick={onIncrease}
        disabled={!canIncrease}
        className="w-6 h-6 rounded-full border border-[#ddd0bc] flex items-center justify-center
                   text-[#7d6550] hover:border-[#c4724a] hover:text-[#c4724a]
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="인분 늘리기"
      >
        <Plus size={11} />
      </button>
    </div>
  );
}
