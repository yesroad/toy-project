'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import searchServices from '@/services/api/search';
import type { SearchResult } from '@/types/api/routeApi/response';
import { searchKeys } from './queryKeys';

export function useInfiniteSearchQuery(query: string) {
  return useInfiniteQuery({
    queryKey: searchKeys.list(query),
    queryFn: ({ pageParam }) => searchServices.getSearchVideos(query, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: SearchResult) => lastPage.nextPageToken,
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
