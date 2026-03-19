'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import recipeServices from '@/services/api/recipe';
import type { Recipe } from '@/types/api/routeApi/response';
import { recipeKeys } from '@/queries/recipe/queryKeys';

type VideoDetail = { title: string; thumbnail: string; channelName: string };

export type RecipeErrorCode =
  | 'CAPTION_UNAVAILABLE'
  | 'CAPTION_EMPTY'
  | 'INSUFFICIENT_INGREDIENTS'
  | 'AI_ANALYSIS_FAILED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

export type RecipeLoadState =
  | { phase: 'idle' }
  | { phase: 'loading_detail' }
  | { phase: 'detail_ready'; detail: VideoDetail }
  | { phase: 'recipe_ready'; recipe: Recipe }
  | { phase: 'error'; message: string; status: number; errorCode: RecipeErrorCode };

export function useRecipeModal(videoId: string | null) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<RecipeLoadState>({ phase: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!videoId) {
      setState({ phase: 'idle' });
      return;
    }

    // TanStack Query 캐시 확인 (staleTime 1시간)
    const cached = queryClient.getQueryData<Recipe>(recipeKeys.detail(videoId));
    if (cached) {
      setState({ phase: 'recipe_ready', recipe: cached });
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setState({ phase: 'loading_detail' });

    recipeServices
      .streamRecipe(
        videoId,
        {
          onVideoDetail: (detail) => setState({ phase: 'detail_ready', detail }),
          onRecipe: (recipe) => {
            // TanStack Query 캐시에 저장 → 다음 열기 시 즉시 반환
            queryClient.setQueryData(recipeKeys.detail(videoId), recipe);
            setState({ phase: 'recipe_ready', recipe });
          },
          onError: (err) =>
            setState({
              phase: 'error',
              message: err.message,
              status: err.status,
              errorCode: (err.errorCode as RecipeErrorCode) ?? 'SERVER_ERROR',
            }),
        },
        abortRef.current.signal,
      )
      .catch((err: unknown) => {
        // AbortError는 모달 닫기로 인한 정상 취소 → 무시
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          phase: 'error',
          message: '연결이 끊겼습니다',
          status: 0,
          errorCode: 'NETWORK_ERROR',
        });
      });

    return () => {
      abortRef.current?.abort();
    };
  }, [videoId, queryClient]);

  return { state };
}
