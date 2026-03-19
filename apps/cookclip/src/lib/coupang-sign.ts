// 쿠팡 파트너스 API HMAC-SHA256 서명 유틸리티
// 서버사이드 전용 (Node.js crypto 사용)

import crypto from 'crypto';

const COUPANG_BASE_URL = 'https://api-gateway.coupang.com';

interface CoupangSignatureOptions {
  method: string;
  url: string;
  accessKey: string;
  secretKey: string;
}

/**
 * 쿠팡 파트너스 API 인증 헤더 생성 (HMAC-SHA256)
 * @see https://developers.coupangapis.com
 */
export function generateCoupangAuthHeader({
  method,
  url,
  accessKey,
  secretKey,
}: CoupangSignatureOptions): string {
  const datetime = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
    .replace(/[-:]/g, '')
    .replace('T', 'T')
    .slice(0, 15);

  const path = url.replace(COUPANG_BASE_URL, '');
  const [pathname, queryString = ''] = path.split('?');

  const message = `${datetime}${method}${pathname}${queryString}`;

  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

/**
 * 쿠팡 파트너스 링크 생성용 API URL 빌드
 */
export function buildCoupangApiUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `${COUPANG_BASE_URL}/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encoded}&limit=1&subId=cookclip`;
}
