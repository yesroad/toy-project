import { generateCoupangAuthHeader, buildCoupangApiUrl } from '@/lib/coupang-sign';
import type { CoupangLinkResponse } from '@/types/coupang.types';

/**
 * 쿠팡 파트너스 검색 링크 생성
 * 실제 API 호출 또는 딥링크 방식으로 링크 반환
 */
export async function generateCoupangLink(keyword: string): Promise<CoupangLinkResponse> {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;

  // 쿠팡 파트너스 키가 없으면 일반 검색 URL로 폴백
  if (!accessKey || !secretKey) {
    return {
      keyword,
      url: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
    };
  }

  const apiUrl = buildCoupangApiUrl(keyword);

  const authHeader = generateCoupangAuthHeader({
    method: 'GET',
    url: apiUrl,
    accessKey,
    secretKey,
  });

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    // API 실패 시 일반 검색 URL 폴백
    return {
      keyword,
      url: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
    };
  }

  const data = await res.json();
  const product = data?.data?.[0];

  if (!product?.productUrl) {
    return {
      keyword,
      url: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
    };
  }

  return {
    keyword,
    url: product.productUrl,
  };
}
