'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useSaveRecipeButton } from './useSaveRecipeButton';

interface SaveRecipeButtonProps {
  videoId: string;
  variant?: 'default' | 'icon' | 'hero';
}

export default function SaveRecipeButton({ videoId, variant = 'default' }: SaveRecipeButtonProps) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const { isSaved, isLoading, toggle } = useSaveRecipeButton(videoId, () => {
    showToast('로그인 후 저장할 수 있어요 🔒');
  });

  const handleToggle = () => {
    const toggled = toggle();
    if (!toggled) return;
    showToast(isSaved ? '저장을 취소했어요' : '레시피를 저장했어요! 💛');
  };

  const renderButton = () => {
    if (variant === 'hero') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          disabled={isLoading}
          aria-label={isSaved ? '저장 취소' : '나의 레시피에 저장'}
          className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center
            backdrop-blur-sm shadow-md transition-all disabled:opacity-60 active:scale-90
            ${isSaved ? 'bg-[#fff4ef]' : 'bg-white/90 hover:bg-white'}`}
        >
          <Heart
            size={20}
            className={isSaved ? 'fill-[#c4724a] stroke-[#c4724a]' : 'stroke-[#7d6550]'}
          />
        </button>
      );
    }

    if (variant === 'icon') {
      return (
        <button
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={isSaved ? '저장 취소' : '레시피 저장'}
          className={`w-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl border-[1.5px] transition-all disabled:opacity-60 active:scale-90 ${
            isSaved
              ? 'border-[#c4724a] bg-[#fff4ef] text-[#c4724a]'
              : 'border-[#ddd0bc] bg-white text-[#7d6550] hover:border-[#c4724a] hover:text-[#c4724a]'
          }`}
        >
          <Heart size={20} className={isSaved ? 'fill-[#c4724a]' : ''} />
          <span className="text-[10px] font-semibold">{isSaved ? '저장됨' : '저장'}</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-1.5 text-[13px] font-medium transition-all disabled:opacity-60 active:scale-90 ${
          isSaved ? 'text-[#c4724a]' : 'text-[#7d6550] hover:text-[#c4724a]'
        }`}
        aria-label={isSaved ? '저장 취소' : '레시피 저장'}
      >
        <Heart size={17} className={isSaved ? 'fill-[#c4724a]' : ''} />
        {isSaved ? '저장됨' : '저장'}
      </button>
    );
  };

  return (
    <>
      {renderButton()}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-[#3d2b1f] text-white text-[13px] font-medium px-5 py-2.5 rounded-full shadow-xl pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </>
  );
}
