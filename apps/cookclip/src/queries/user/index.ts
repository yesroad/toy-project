'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userServices from '@/services/api/user';
import { userKeys } from './queryKeys';
import { userRecipesKeys } from '@/queries/user-recipes/queryKeys';
import { useAuth } from '@/hooks/useAuth';

export function useSavedRecipesQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: userKeys.savedRecipes(),
    queryFn: () => userServices.getSavedRecipes(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveRecipeMutation(videoId: string) {
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: () => userServices.saveRecipe(videoId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userKeys.savedRecipes() });
      const previous = queryClient.getQueryData<{ savedVideoIds: string[] }>(
        userKeys.savedRecipes(),
      );
      queryClient.setQueryData<{ savedVideoIds: string[] }>(userKeys.savedRecipes(), (old) => ({
        savedVideoIds: [...(old?.savedVideoIds ?? []), videoId],
      }));
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(userKeys.savedRecipes(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.savedRecipes() });
      queryClient.invalidateQueries({ queryKey: userRecipesKeys.saved() });
    },
  });

  const unsave = useMutation({
    mutationFn: () => userServices.unsaveRecipe(videoId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userKeys.savedRecipes() });
      const previous = queryClient.getQueryData<{ savedVideoIds: string[] }>(
        userKeys.savedRecipes(),
      );
      queryClient.setQueryData<{ savedVideoIds: string[] }>(userKeys.savedRecipes(), (old) => ({
        savedVideoIds: (old?.savedVideoIds ?? []).filter((id) => id !== videoId),
      }));
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(userKeys.savedRecipes(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.savedRecipes() });
      queryClient.invalidateQueries({ queryKey: userRecipesKeys.saved() });
    },
  });

  return { save, unsave };
}
