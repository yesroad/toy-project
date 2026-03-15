import type { CoupangLinkResponse } from '@/types/coupang.types';

const COUPANG_SEARCH_BASE = 'https://www.coupang.com/np/search?q=';

/**
 * [MVP 1단계] DB에 사전 저장된 coupang_links에서 재료명으로 링크 조회
 * 매핑이 없으면 쿠팡 일반 검색 URL 반환
 *
 * [2단계] 쿠팡 파트너스 API 발급 후 실시간 호출로 교체 예정
 */
export function getCoupangLinkFromCache(
  keyword: string,
  coupangLinks: Record<string, string> | null | undefined,
): CoupangLinkResponse {
  const url = coupangLinks?.[keyword] ?? `${COUPANG_SEARCH_BASE}${encodeURIComponent(keyword)}`;
  return { keyword, url };
}

/**
 * [2단계 스텁] 쿠팡 파트너스 API 실시간 호출
 * API 키 발급 후 coupang-sign.ts 활용하여 구현
 */
export async function generateCoupangLink(keyword: string): Promise<CoupangLinkResponse> {
  // TODO: 쿠팡 파트너스 API 발급 후 구현
  // import { generateCoupangAuthHeader, buildCoupangApiUrl } from '@/lib/coupang-sign'
  return {
    keyword,
    url: `${COUPANG_SEARCH_BASE}${encodeURIComponent(keyword)}`,
  };
}
