'use client';

import { useQuery } from '@tanstack/react-query';
import type { Recipe } from '@/types/recipe.types';
import { recipeKeys } from './queryKeys';

async function fetchRecipe(videoId: string): Promise<Recipe> {
  const res = await fetch('/api/recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? '레시피 분석에 실패했습니다');
  }

  const { recipe } = await res.json();
  return recipe;
}

/**
 * 영상 레시피 분석 훅
 * videoId가 없으면 쿼리 비활성화. staleTime 1시간 (GPT 분석 비용 절감)
 */
export function useRecipeQuery(videoId: string | null) {
  return useQuery({
    queryKey: recipeKeys.detail(videoId ?? ''),
    queryFn: () => fetchRecipe(videoId!),
    enabled: !!videoId,
    staleTime: 60 * 60 * 1000, // 1시간
    retry: 0, // 422(자막 없음) 같은 에러는 재시도 불필요
  });
}
