'use client';

import { useRecipeQuery } from '@/queries/recipe';

export function useRecipeModal(videoId: string | null) {
  const { data: recipe, isLoading, isError } = useRecipeQuery(videoId);
  return { recipe, isLoading, isError };
}
