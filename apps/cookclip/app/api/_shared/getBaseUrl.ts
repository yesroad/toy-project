/**
 * 현재 환경의 Base URL을 반환하는 헬퍼.
 *
 * Edge Runtime은 server-only 모듈 사용 불가이므로
 * serverEnv 대신 process.env를 직접 참조한다.
 *
 * 우선순위:
 * 1. VERCEL_URL (Vercel 배포 환경 자동 주입)
 * 2. NEXT_PUBLIC_APP_URL (환경변수 수동 설정)
 * 3. http://localhost:3000 (로컬 개발 기본값)
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
