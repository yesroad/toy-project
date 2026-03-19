'use client';

import { useQuery } from '@tanstack/react-query';
import openaiServices from '@/services/api/openai';
import type { RecipeAnalysis } from '@/types/api/openai/response';
import type { UseQueryOptionsBase } from '@/types/queries';
import { openaiKeys } from './queryKeys';

export function useOpenAIAnalyzeQuery(
  caption: string | null,
  options?: UseQueryOptionsBase<RecipeAnalysis>,
) {
  return useQuery({
    queryKey: openaiKeys.recipe.analyze(caption ?? ''),
    queryFn: () => openaiServices.analyzeRecipe(caption!),
    enabled: !!caption && caption.trim().length > 0,
    staleTime: 60 * 60 * 1000, // 1시간 (동일 자막 재분석 방지)
    retry: 0,
    ...options,
  });
}
