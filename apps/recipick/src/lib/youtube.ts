// YouTube 채널 필터링 관련 순수 함수

const COOKING_KEYWORDS = [
  '요리',
  '레시피',
  'cooking',
  'recipe',
  'chef',
  'kitchen',
  'food',
  '먹방',
  '맛집',
  '베이킹',
  'baking',
  '쿡',
  'cook',
  'cuisine',
  'meal',
  'dish',
];

/**
 * 채널명 또는 영상 제목을 기반으로 요리 관련 채널인지 판단
 */
export function isCookingChannel(channelName: string, title: string): boolean {
  const text = `${channelName} ${title}`.toLowerCase();
  return COOKING_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * YouTube 썸네일 URL 정규화 (고화질 우선)
 */
export function normalizeThumbnailUrl(thumbnails: Record<string, { url: string }>): string {
  return thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? '';
}
