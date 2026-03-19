'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import searchServices from '@/services/api/search';
import type { SearchResult } from '@/types/api/routeApi/response';
import { searchKeys } from './queryKeys';

export function useInfiniteSearchQuery(query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: searchKeys.list(query),
    queryFn: ({ pageParam }) => searchServices.getSearchVideos(query, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: SearchResult) => lastPage.nextPageToken,
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useDbCachedSearchQuery(query: string) {
  return useQuery({
    queryKey: searchKeys.cached(query),
    queryFn: () => searchServices.getCachedVideos(query),
    enabled: query.trim().length > 0,
    staleTime: 0, // 매번 최신 DB 확인 (YouTube API 결과가 쌓일수록 DB에 데이터 증가)
    select: (data) => data.videos,
  });
}
