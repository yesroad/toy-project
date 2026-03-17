// /api Route 요청 타입

export interface SearchRequest {
  q: string;
  pageToken?: string;
}

export interface RecipeRequest {
  videoId: string;
  /** 클라이언트(브라우저)에서 직접 취득한 자막 텍스트. 있으면 서버 자막 fetch 스킵. */
  caption?: string;
  captionLang?: 'ko' | 'en';
}
