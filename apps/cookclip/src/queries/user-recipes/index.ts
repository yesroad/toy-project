'use client';

import { useQuery } from '@tanstack/react-query';
import userRecipesServices from '@/services/api/user-recipes';
import { userRecipesKeys } from './queryKeys';
import { useAuth } from '@/hooks/useAuth';

export function useSavedRecipeItemsQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: userRecipesKeys.saved(),
    queryFn: () => userRecipesServices.getSavedRecipeItems(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}
