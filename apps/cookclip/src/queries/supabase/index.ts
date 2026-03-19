'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabaseServices from '@/services/api/supabase';
import type { Recipe } from '@/types/api/routeApi/response';
import type { UseQueryOptionsBase } from '@/types/queries';
import { supabaseKeys } from './queryKeys';

export function useSupabaseCacheQuery(
  videoId: string | null,
  options?: UseQueryOptionsBase<{ recipe: Recipe | null }>,
) {
  return useQuery({
    queryKey: supabaseKeys.cache.detail(videoId ?? ''),
    queryFn: () => supabaseServices.getCachedRecipe(videoId!),
    enabled: !!videoId,
    staleTime: 60 * 60 * 1000, // 1시간
    ...options,
  });
}

export function useSupabaseCacheMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: Omit<Recipe, 'cached'>) => supabaseServices.setCachedRecipe(recipe),
    onSuccess: (_, recipe) => {
      queryClient.invalidateQueries({ queryKey: supabaseKeys.cache.detail(recipe.videoId) });
    },
  });
}
