'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSavedRecipesQuery, useSaveRecipeMutation } from '@/queries/user';

export function useSaveRecipeButton(videoId: string) {
  const { user } = useAuth();
  const { data: savedData } = useSavedRecipesQuery();
  const { save, unsave } = useSaveRecipeMutation(videoId);

  const isSaved = savedData?.savedVideoIds.includes(videoId) ?? false;
  const isLoading = save.isPending || unsave.isPending;

  const toggle = () => {
    if (!user) {
      alert('레시피를 저장하려면 로그인이 필요해요');
      return;
    }
    if (isSaved) {
      unsave.mutate();
    } else {
      save.mutate();
    }
  };

  return { isSaved, isLoading, toggle };
}
