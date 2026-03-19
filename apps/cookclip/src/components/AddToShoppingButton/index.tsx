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

  const handleAdd = () => {
    addIngredients(ingredients, videoId, videoTitle);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
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
  );
}
