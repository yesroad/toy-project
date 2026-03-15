'use client';

import { useCallback, useEffect, useState } from 'react';
import { addTab, clearTabs, parseTabs, removeTab } from '@/lib/search-history';
import type { SearchTab } from '@/lib/search-history';

const STORAGE_KEY = 'recipick:search-tabs';

/**
 * 검색 기록 탭 관리 훅
 * localStorage 지연 초기화로 SSR hydration 오류 방지
 */
export function useSearchHistory() {
  const [tabs, setTabs] = useState<SearchTab[]>(() => {
    if (typeof window === 'undefined') return [];
    return parseTabs(localStorage.getItem(STORAGE_KEY));
  });

  // tabs 변경 시 localStorage 동기화
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  const add = useCallback((query: string) => {
    setTabs((prev) => addTab(prev, query));
  }, []);

  const remove = useCallback((id: string) => {
    setTabs((prev) => removeTab(prev, id));
  }, []);

  const clear = useCallback(() => {
    setTabs(clearTabs());
  }, []);

  return { tabs, add, remove, clear };
}
