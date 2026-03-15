// YouTube 영상 필터링 관련 순수 함수

/** 제목 포함 키워드: 하나라도 포함되어야 통과 (1차 필터) */
export const TITLE_INCLUDE_KEYWORDS = [
  '레시피',
  '요리',
  '만드는 법',
  '만드는법',
  '만들기',
  '요리법',
  'cook',
  'recipe',
  'how to cook',
  'cooking',
] as const;

/** 제목 제외 키워드: 하나라도 포함되면 제외 (1차 필터) */
export const TITLE_EXCLUDE_KEYWORDS = [
  '먹방',
  'mukbang',
  'asmr',
  'vlog',
  '리뷰',
  'review',
  '브랜드',
  'haul',
] as const;

/** 화이트리스트 채널 ID (조회수 기준 무관하게 통과) */
export const CHANNEL_WHITELIST: readonly string[] = [];

/** 조회수 최소 기준 */
export const MIN_VIEW_COUNT = 10_000;

/**
 * 영상 제목 기반 1차 필터
 * - 제외 키워드 포함 시 false
 * - 포함 키워드 미포함 시 false
 */
export function filterVideoByTitle(title: string): boolean {
  const lower = title.toLowerCase();
  if (TITLE_EXCLUDE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) return false;
  return TITLE_INCLUDE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * YouTube 썸네일 URL 정규화 (고화질 우선)
 */
export function normalizeThumbnailUrl(thumbnails: Record<string, { url: string }>): string {
  return thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? '';
}
