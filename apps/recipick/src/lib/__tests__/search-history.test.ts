import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { addTab, removeTab, clearTabs, parseTabs, type SearchTab } from '../search-history';

const FIXED_DATE = new Date('2024-01-15T00:00:00.000Z');

describe('addTab', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('정상 케이스', () => {
    it('빈 배열에 새 탭 추가', () => {
      const result = addTab([], '떡볶이');
      expect(result).toHaveLength(1);
      expect(result[0].query).toBe('떡볶이');
    });

    it('기존 탭 앞에 새 탭 추가 (최신 순)', () => {
      const existing: SearchTab[] = [{ id: 'tab-1', query: '김치찌개', createdAt: 1 }];
      const result = addTab(existing, '된장찌개');
      expect(result[0].query).toBe('된장찌개');
      expect(result[1].query).toBe('김치찌개');
    });

    it('동일 쿼리가 있으면 맨 앞으로 이동 (중복 제거)', () => {
      const tabs: SearchTab[] = [
        { id: 'tab-1', query: '김치찌개', createdAt: 1 },
        { id: 'tab-2', query: '된장찌개', createdAt: 2 },
      ];
      const result = addTab(tabs, '김치찌개');
      expect(result[0].query).toBe('김치찌개');
      expect(result).toHaveLength(2);
    });

    it('동일 쿼리 이동 시 기존 탭 id는 사라지고 새 id 생성', () => {
      const tabs: SearchTab[] = [{ id: 'tab-old', query: '김치찌개', createdAt: 1 }];
      const result = addTab(tabs, '김치찌개');
      expect(result[0].id).not.toBe('tab-old');
    });

    it('쿼리를 trim 처리', () => {
      const result = addTab([], '  떡볶이  ');
      expect(result[0].query).toBe('떡볶이');
    });
  });

  describe('경계값', () => {
    it('빈 문자열이면 탭 추가 안 함', () => {
      const result = addTab([], '');
      expect(result).toHaveLength(0);
    });

    it('공백만 있는 문자열이면 탭 추가 안 함', () => {
      const existing: SearchTab[] = [{ id: 'tab-1', query: '김치찌개', createdAt: 1 }];
      const result = addTab(existing, '   ');
      expect(result).toEqual(existing);
    });

    it('5개 초과 시 오래된 탭 제거 (MAX_TABS=5)', () => {
      const tabs: SearchTab[] = Array.from({ length: 5 }, (_, i) => ({
        id: `tab-${i}`,
        query: `query-${i}`,
        createdAt: i,
      }));
      const result = addTab(tabs, 'new-query');
      expect(result).toHaveLength(5);
      expect(result[0].query).toBe('new-query');
    });

    it('createdAt이 고정 시간(Date.now()) 값으로 설정됨', () => {
      const result = addTab([], '떡볶이');
      expect(result[0].createdAt).toBe(FIXED_DATE.getTime());
    });
  });

  describe('정책 케이스', () => {
    it('중복 쿼리 이동 후에도 총 탭 수 유지', () => {
      const tabs: SearchTab[] = [
        { id: 'tab-1', query: 'A', createdAt: 1 },
        { id: 'tab-2', query: 'B', createdAt: 2 },
        { id: 'tab-3', query: 'C', createdAt: 3 },
      ];
      const result = addTab(tabs, 'A');
      expect(result).toHaveLength(3);
    });
  });
});

describe('removeTab', () => {
  describe('정상 케이스', () => {
    it('지정 id의 탭 제거', () => {
      const tabs: SearchTab[] = [
        { id: 'tab-1', query: '김치찌개', createdAt: 1 },
        { id: 'tab-2', query: '된장찌개', createdAt: 2 },
      ];
      const result = removeTab(tabs, 'tab-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('tab-2');
    });

    it('남은 탭의 순서 유지', () => {
      const tabs: SearchTab[] = [
        { id: 'tab-1', query: 'A', createdAt: 1 },
        { id: 'tab-2', query: 'B', createdAt: 2 },
        { id: 'tab-3', query: 'C', createdAt: 3 },
      ];
      const result = removeTab(tabs, 'tab-2');
      expect(result.map((t) => t.query)).toEqual(['A', 'C']);
    });
  });

  describe('경계값', () => {
    it('존재하지 않는 id 제거 시 원본 반환', () => {
      const tabs: SearchTab[] = [{ id: 'tab-1', query: '김치찌개', createdAt: 1 }];
      const result = removeTab(tabs, 'non-existent');
      expect(result).toEqual(tabs);
    });

    it('빈 배열에서 제거 시 빈 배열 반환', () => {
      expect(removeTab([], 'tab-1')).toEqual([]);
    });
  });
});

describe('clearTabs', () => {
  it('빈 배열 반환', () => {
    expect(clearTabs()).toEqual([]);
  });
});

describe('parseTabs', () => {
  describe('정상 케이스', () => {
    it('유효한 JSON 배열 파싱', () => {
      const tabs: SearchTab[] = [{ id: 'tab-1', query: '떡볶이', createdAt: 123 }];
      const result = parseTabs(JSON.stringify(tabs));
      expect(result).toHaveLength(1);
      expect(result[0].query).toBe('떡볶이');
    });

    it('유효한 탭만 필터링 (id/query/createdAt 타입 검증)', () => {
      const raw = JSON.stringify([
        { id: 'tab-1', query: '떡볶이', createdAt: 123 }, // 유효
        { id: 123, query: '된장찌개', createdAt: 456 }, // id 타입 오류
        { id: 'tab-3', query: 789, createdAt: 789 }, // query 타입 오류
        { id: 'tab-4', query: '순대', createdAt: '시간' }, // createdAt 타입 오류
      ]);
      const result = parseTabs(raw);
      expect(result).toHaveLength(1);
      expect(result[0].query).toBe('떡볶이');
    });
  });

  describe('경계값', () => {
    it('null이면 빈 배열 반환', () => {
      expect(parseTabs(null)).toEqual([]);
    });

    it('빈 문자열이면 빈 배열 반환', () => {
      expect(parseTabs('')).toEqual([]);
    });

    it('배열이 아닌 JSON이면 빈 배열 반환', () => {
      expect(parseTabs(JSON.stringify({ id: 'tab-1' }))).toEqual([]);
    });
  });

  describe('에러 케이스', () => {
    it('잘못된 JSON이면 빈 배열 반환', () => {
      expect(parseTabs('{invalid json')).toEqual([]);
    });

    it('빈 배열 JSON이면 빈 배열 반환', () => {
      expect(parseTabs('[]')).toEqual([]);
    });
  });
});
