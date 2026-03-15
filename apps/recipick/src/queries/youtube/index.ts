'use client';

import { useQuery } from '@tanstack/react-query';
import youtubeServices from '@/services/api/youtube';
import type { UseQueryOptionsBase } from '@/types/queries';
import type { SearchResult } from '@/types/api/routeApi/response';
import { youtubeKeys } from './queryKeys';

export function useYoutubeSearchQuery(
  query: string,
  pageToken?: string,
  options?: UseQueryOptionsBase<SearchResult>,
) {
  return useQuery({
    queryKey: youtubeKeys.search.list(query, pageToken),
    queryFn: () => youtubeServices.searchVideos(query, pageToken),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

export function useYoutubeCaptionQuery(
  videoId: string | null,
  options?: UseQueryOptionsBase<{ caption: string }>,
) {
  return useQuery({
    queryKey: youtubeKeys.caption.detail(videoId ?? ''),
    queryFn: () => youtubeServices.getCaption(videoId!),
    enabled: !!videoId,
    staleTime: 60 * 60 * 1000, // 1시간
    ...options,
  });
}
