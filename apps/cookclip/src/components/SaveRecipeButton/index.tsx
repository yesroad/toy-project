'use client';

import { Heart } from 'lucide-react';
import { useSaveRecipeButton } from './useSaveRecipeButton';

interface SaveRecipeButtonProps {
  videoId: string;
}

export default function SaveRecipeButton({ videoId }: SaveRecipeButtonProps) {
  const { isSaved, isLoading, toggle } = useSaveRecipeButton(videoId);

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors disabled:opacity-60 ${
        isSaved ? 'text-[#c4724a]' : 'text-[#7d6550] hover:text-[#c4724a]'
      }`}
      aria-label={isSaved ? '저장 취소' : '레시피 저장'}
    >
      <Heart size={15} className={isSaved ? 'fill-[#c4724a]' : ''} />
      {isSaved ? '저장됨' : '저장'}
    </button>
  );
}
