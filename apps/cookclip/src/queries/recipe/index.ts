'use client';

import { useQuery } from '@tanstack/react-query';
import recipeServices from '@/services/api/recipe';
import type { Recipe } from '@/types/api/routeApi/response';
import type { UseQueryOptionsBase } from '@/types/queries';
import { recipeKeys } from './queryKeys';

export function useRecipeQuery(videoId: string | null, options?: UseQueryOptionsBase<Recipe>) {
  return useQuery({
    queryKey: recipeKeys.detail(videoId ?? ''),
    queryFn: () => recipeServices.getRecipe(videoId!).then(({ recipe }) => recipe),
    enabled: !!videoId,
    staleTime: 60 * 60 * 1000, // 1시간 (GPT 분석 비용 절감)
    retry: 0, // 422(자막 없음) 같은 에러는 재시도 불필요
    ...options,
  });
}
