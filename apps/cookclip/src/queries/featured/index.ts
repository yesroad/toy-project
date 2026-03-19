'use client';

import { useQuery } from '@tanstack/react-query';
import featuredServices from '@/services/api/featured';
import { featuredKeys } from './queryKeys';

export function useFeaturedRecipesQuery() {
  return useQuery({
    queryKey: featuredKeys.recipes(),
    queryFn: () => featuredServices.getFeaturedRecipes(),
    staleTime: 5 * 60 * 1000, // 5분
  });
}
