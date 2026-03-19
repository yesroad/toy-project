'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSavedRecipesQuery, useSaveRecipeMutation } from '@/queries/user';

export function useSaveRecipeButton(videoId: string, onLoginRequired?: () => void) {
  const { user } = useAuth();
  const { data: savedData } = useSavedRecipesQuery();
  const { save, unsave } = useSaveRecipeMutation(videoId);

  const isSaved = savedData?.savedVideoIds.includes(videoId) ?? false;
  const isLoading = save.isPending || unsave.isPending;

  const toggle = (): boolean => {
    if (!user) {
      onLoginRequired?.();
      return false;
    }
    if (isSaved) {
      unsave.mutate();
    } else {
      save.mutate();
    }
    return true;
  };

  return { isSaved, isLoading, toggle };
}
