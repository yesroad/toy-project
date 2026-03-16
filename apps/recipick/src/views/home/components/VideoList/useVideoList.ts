'use client';

import { useEffect, useState } from 'react';
import { useInfiniteSearchQuery } from '@/queries/search';

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 6;

export function useVideoList(query: string) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteSearchQuery(query);

  const [displayCount, setDisplayCount] = useState(INITIAL_COUNT);

  // 검색어 변경 시 displayCount 초기화
  useEffect(() => {
    setDisplayCount(INITIAL_COUNT);
  }, [query]);

  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];
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

  return { videos, isLoading, isFetchingNextPage, canLoadMore, handleLoadMore };
}
