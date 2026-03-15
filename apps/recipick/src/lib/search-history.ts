// 검색 기록 탭 CRUD 순수 함수 (localStorage 키는 훅에서 관리)

export interface SearchTab {
  id: string;
  query: string;
  createdAt: number;
}

const MAX_TABS = 5;

/**
 * 새 탭 추가. 동일 쿼리가 있으면 맨 앞으로 이동.
 * 최대 MAX_TABS개 유지 (오래된 탭 제거)
 */
export function addTab(tabs: SearchTab[], query: string): SearchTab[] {
  const trimmed = query.trim();
  if (!trimmed) return tabs;

  const filtered = tabs.filter((tab) => tab.query !== trimmed);
  const newTab: SearchTab = {
    id: `tab-${Date.now()}`,
    query: trimmed,
    createdAt: Date.now(),
  };

  return [newTab, ...filtered].slice(0, MAX_TABS);
}

/**
 * 특정 탭 제거
 */
export function removeTab(tabs: SearchTab[], id: string): SearchTab[] {
  return tabs.filter((tab) => tab.id !== id);
}

/**
 * 모든 탭 초기화
 */
export function clearTabs(): SearchTab[] {
  return [];
}

/**
 * JSON 문자열을 SearchTab 배열로 파싱 (파싱 실패 시 빈 배열 반환)
 */
export function parseTabs(raw: string | null): SearchTab[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item.id === 'string' &&
        typeof item.query === 'string' &&
        typeof item.createdAt === 'number',
    );
  } catch {
    return [];
  }
}
