'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { SearchResult } from '@/types/youtube.types';
import { searchKeys } from './queryKeys';

async function fetchSearchVideos(query: string, pageToken?: string): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'YouTube 검색에 실패했습니다');
  }
  return res.json();
}

/**
 * YouTube 영상 무한 스크롤 검색 훅
 * pageToken 기반 페이지네이션 (다음 페이지 없으면 undefined 반환)
 */
export function useInfiniteSearchQuery(query: string) {
  return useInfiniteQuery({
    queryKey: searchKeys.list(query),
    queryFn: ({ pageParam }) => fetchSearchVideos(query, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5분 (서버 ISR 캐시와 일치)
  });
}
