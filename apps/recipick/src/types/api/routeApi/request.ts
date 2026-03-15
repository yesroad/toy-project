// /api Route 요청 타입

export interface SearchRequest {
  q: string;
  pageToken?: string;
}

export interface RecipeRequest {
  videoId: string;
}
