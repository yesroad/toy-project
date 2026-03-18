// /api Route 응답 타입

export interface Ingredient {
  name: string;
  amount: string;
}

// ingredientName → coupang URL 매핑 (MVP: DB 사전 저장, 2단계: API 실시간 조회)
export type CoupangLinks = Record<string, string>;

export interface RecipeStep {
  description: string;
  ingredients?: string[]; // 이 단계에 사용하는 재료명 목록
  duration?: number; // 초 단위
}

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
  // Phase 2 확장 필드 (optional — 기존 캐시 하위 호환)
  servings?: string; // "2인분", "3~4인분"
  cookingTime?: number; // 분 단위
  difficulty?: 'easy' | 'medium' | 'hard';
  calories?: number;
  tips?: string[];
  notes?: string[];
  stepDetails?: RecipeStep[]; // steps와 병행 저장 (breaking change 없음)
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

export interface CachedSearchResponse {
  videos: VideoItem[];
}
