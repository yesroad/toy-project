'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import type { Ingredient } from '@/types/api/routeApi/response';
import { useShoppingList } from '@/hooks/useShoppingList';

interface AddToShoppingButtonProps {
  ingredients: Ingredient[];
  videoId: string;
  videoTitle: string;
}

export default function AddToShoppingButton({
  ingredients,
  videoId,
  videoTitle,
}: AddToShoppingButtonProps) {
  const { addIngredients } = useShoppingList();
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleAdd = () => {
    addIngredients(ingredients, videoId, videoTitle);
    setAdded(true);
    setToast(`재료 ${ingredients.length}개를 장보기에 추가했어요 🛒`);
    setTimeout(() => {
      setAdded(false);
      setToast(null);
    }, 2000);
  };

  return (
    <>
      <a
        href="/shopping"
        onClick={(e) => {
          if (!added) {
            e.preventDefault();
            handleAdd();
          }
        }}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[#7d6550] hover:text-[#c4724a] transition-colors"
      >
        {added ? <Check size={15} className="text-[#c4724a]" /> : <ShoppingCart size={15} />}
        {added ? '추가됨 → 보기' : '장보기'}
      </a>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-[#3d2b1f] text-white text-[13px] font-medium px-5 py-2.5 rounded-full shadow-xl pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </>
  );
}
