'use client';

import { useEffect, useState } from 'react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useInfiniteSearchQuery } from '@/queries/search';

export function useHomeView() {
  const [query, setQuery] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { tabs, add, remove } = useSearchHistory();

  const { data, isLoading } = useInfiniteSearchQuery(query);
  const videos = data?.pages.flatMap((page) => page.videos) ?? [];

  // 검색 완료 후 결과가 있을 때만 기록 저장
  useEffect(() => {
    if (query && !isLoading && videos.length > 0) {
      add(query);
    }
  }, [query, isLoading, videos.length, add]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleTabRemove = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab && tab.query === query) {
      setQuery('');
    }
    remove(id);
  };

  return {
    query,
    selectedVideoId,
    setSelectedVideoId,
    tabs,
    isLoading,
    handleSearch,
    handleTabRemove,
    setQuery,
  };
}
