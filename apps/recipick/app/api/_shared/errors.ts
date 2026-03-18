// API Route 공통 에러 정의

/**
 * API Route에서 발생하는 에러를 HTTP 상태 코드와 함께 표현.
 * youtube/route.ts에서 사용하는 에러 클래스.
 */
export class ApiRouteError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

/**
 * recipe/route.ts SSE 스트림에서 전송하는 에러 코드 상수.
 * 클라이언트(services/api/recipe.ts)에서 errorCode 필드로 수신.
 */
export const SSE_ERROR = {
  NO_CAPTION: 'CAPTION_UNAVAILABLE',
  INSUFFICIENT_INGREDIENTS: 'INSUFFICIENT_INGREDIENTS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN: 'SERVER_ERROR',
} as const;
