'use client';

import { useEffect, useState } from 'react';
import { useInfiniteSearchQuery, useDbCachedSearchQuery } from '@/queries/search';
import type { VideoItem } from '@/types/api/routeApi/response';

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 6;

export function useVideoList(query: string) {
  const { data: dbVideos, isLoading: isDbLoading } = useDbCachedSearchQuery(query);

  // DB 조회 완료 후 결과가 없을 때만 YouTube API 호출 → 쿼터 절약
  const shouldCallApi = !isDbLoading && (!dbVideos || dbVideos.length === 0);
  const {
    data: apiData,
    isLoading: isApiLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteSearchQuery(query, shouldCallApi);

  const [displayCount, setDisplayCount] = useState(INITIAL_COUNT);

  // 검색어 변경 시 displayCount 초기화
  useEffect(() => {
    setDisplayCount(INITIAL_COUNT);
  }, [query]);

  // 병합: DB 결과 먼저, API에서 중복 videoId 제거 후 추가
  const allVideos: VideoItem[] = (() => {
    const apiVideos = apiData?.pages.flatMap((page) => page.videos) ?? [];
    if (!dbVideos || dbVideos.length === 0) return apiVideos;

    const dbVideoIds = new Set(dbVideos.map((v) => v.videoId));
    return [...dbVideos, ...apiVideos.filter((v) => !dbVideoIds.has(v.videoId))];
  })();

  const videos = allVideos.slice(0, displayCount);

  const handleLoadMore = () => {
    const nextCount = displayCount + LOAD_MORE_COUNT;
    setDisplayCount(nextCount);

    // 표시할 데이터가 부족하면 다음 페이지 fetch
    if (nextCount >= allVideos.length && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const canLoadMore = displayCount < allVideos.length || (hasNextPage ?? false);

  // DB 또는 API 중 하나라도 데이터 있으면 스피너 숨김
  const isLoading = allVideos.length === 0 && (isDbLoading || isApiLoading);

  return { videos, isLoading, isFetchingNextPage, canLoadMore, handleLoadMore };
}
