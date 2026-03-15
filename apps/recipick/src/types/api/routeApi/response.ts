// /api Route 응답 타입

export interface Ingredient {
  name: string;
  amount: string;
}

// ingredientName → coupang URL 매핑 (MVP: DB 사전 저장, 2단계: API 실시간 조회)
export type CoupangLinks = Record<string, string>;

export interface Recipe {
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  ingredients: Ingredient[];
  steps: string[];
  coupangLinks?: CoupangLinks;
  rawCaption?: string;
  cached: boolean;
  createdAt?: string;
}

export interface RecipeResponse {
  recipe: Recipe;
}

export interface VideoItem {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  publishedAt: string;
}

export interface SearchResult {
  videos: VideoItem[];
  nextPageToken?: string;
}

export interface SearchResponse extends SearchResult {}
