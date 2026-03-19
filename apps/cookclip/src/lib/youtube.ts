// YouTube 영상 필터링 및 병합 관련 순수 함수

import type { VideoItem } from '@/types/api/routeApi/response';

/** Hard exclude — 하나라도 포함 시 즉시 탈락 */
export const HARD_EXCLUDE_KEYWORDS = [
  '먹방',
  'mukbang',
  'asmr',
  'vlog',
  '브이로그',
  '하울',
  'haul',
  '언박싱',
  'unboxing',
] as const;

/** Soft exclude — 감점 (-2점) */
export const SOFT_EXCLUDE_KEYWORDS = ['리뷰', 'review', '맛집', '배달', '편의점', '시식'] as const;

/** 요리 신호 키워드 — 제목 포함 시 +2점, description 포함 시 +1점 */
export const COOKING_SIGNAL_KEYWORDS = [
  '레시피',
  'recipe',
  '요리',
  'cook',
  'cooking',
  '만드는 법',
  '만드는법',
  '만들기',
  '요리법',
  'how to cook',
  '황금비율',
  '황금레시피',
  '간단',
  '초간단',
  '자취',
  '집밥',
  '홈쿡',
  'homemade',
  '양념',
  '소스',
  '끓이',
  '볶',
  '구이',
  '찜',
  '조림',
  '무침',
  '절임',
] as const;

/** 화이트리스트 채널 ID (점수 무관하게 즉시 통과) */
export const CHANNEL_WHITELIST: readonly string[] = [];

/** Shorts 최대 길이 (초) */
const MAX_SHORTS_DURATION_SECONDS = 60;

/** 통과 최소 점수 */
const MIN_SCORE = 2;

/** 조회수 점수 임계값 */
const VIEW_COUNT_HIGH = 100_000;
const VIEW_COUNT_MID = 10_000;

/**
 * ISO 8601 duration 문자열을 초 단위로 변환
 * 예: "PT15M33S" → 933, "PT1H2M3S" → 3723
 */
export function parseDurationSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

interface FilterVideoParams {
  channelId: string;
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  viewCount: number;
  durationSeconds: number;
}

/**
 * 통합 필터 함수 — 다중 신호를 종합하여 요리 영상 여부를 판별
 * - Hard exclude 키워드 → 즉시 false
 * - duration ≤ 60초 → 즉시 false (Shorts)
 * - 화이트리스트 채널 → 즉시 true
 * - 점수 계산 후 임계값(≥2) 통과 여부 반환
 */
export function filterVideo({
  channelId,
  title,
  description,
  tags,
  categoryId,
  viewCount,
  durationSeconds,
}: FilterVideoParams): boolean {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();

  // Hard exclude — 즉시 탈락
  if (HARD_EXCLUDE_KEYWORDS.some((kw) => titleLower.includes(kw.toLowerCase()))) return false;

  // Shorts 판별 (duration 기반)
  if (durationSeconds > 0 && durationSeconds <= MAX_SHORTS_DURATION_SECONDS) return false;

  // 화이트리스트 채널 — 즉시 통과
  if (CHANNEL_WHITELIST.includes(channelId)) return true;

  let score = 0;

  // 제목 요리 신호 (+2/키워드)
  for (const kw of COOKING_SIGNAL_KEYWORDS) {
    if (titleLower.includes(kw.toLowerCase())) score += 2;
  }

  // Description 요리 신호 (+1/키워드, 최대 4점)
  let descSignalCount = 0;
  for (const kw of COOKING_SIGNAL_KEYWORDS) {
    if (descLower.includes(kw.toLowerCase())) {
      score += 1;
      descSignalCount++;
      if (descSignalCount >= 4) break;
    }
  }

  // Tags 요리 신호 (+1/키워드, 최대 2점)
  if (tags && tags.length > 0) {
    let tagSignalCount = 0;
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      if (COOKING_SIGNAL_KEYWORDS.some((kw) => tagLower.includes(kw.toLowerCase()))) {
        score += 1;
        tagSignalCount++;
        if (tagSignalCount >= 2) break;
      }
    }
  }

  // Soft exclude (-2/키워드)
  for (const kw of SOFT_EXCLUDE_KEYWORDS) {
    if (titleLower.includes(kw.toLowerCase())) score -= 2;
  }

  // 카테고리 보너스: 26=Howto&Style, 22=People&Blogs (+2)
  if (categoryId === '26' || categoryId === '22') score += 2;

  // 조회수 보너스
  if (viewCount >= VIEW_COUNT_HIGH) score += 2;
  else if (viewCount >= VIEW_COUNT_MID) score += 1;

  return score >= MIN_SCORE;
}

/**
 * YouTube 썸네일 URL 정규화 (고화질 우선)
 */
export function normalizeThumbnailUrl(thumbnails: Record<string, { url: string }>): string {
  return thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? '';
}

/**
 * DB 결과와 YouTube API 결과를 병합.
 * DB 결과를 앞에 배치하고, API 결과에서 중복 videoId를 제거한 후 뒤에 추가.
 */
export function mergeVideos(dbVideos: VideoItem[], apiVideos: VideoItem[]): VideoItem[] {
  const dbVideoIds = new Set(dbVideos.map((v) => v.videoId));
  return [...dbVideos, ...apiVideos.filter((v) => !dbVideoIds.has(v.videoId))];
}

/**
 * YouTube URL에서 videoId 추출
 * 지원 형식: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function extractVideoIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] ?? null;
      }
    }
    return null;
  } catch {
    return null;
  }
}
