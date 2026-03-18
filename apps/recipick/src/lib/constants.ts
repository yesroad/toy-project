// 타임아웃 상수 (ms 단위)
export const TIMEOUT = {
  RECIPE_HTTP: 120_000, // services/api/recipe.ts axios timeout (OpenAI + YouTube 스크래핑 소요 시간)
  CAPTION_SERVER: 6_000, // services/captionService.ts Edge Route 요청
  CAPTION_CLIENT: 3_000, // lib/clientCaption.ts 브라우저 자막 조회
  CAPTION_ABORT: 7_000, // app/api/recipe/route.ts caption 서버 요청 abort
} as const;
