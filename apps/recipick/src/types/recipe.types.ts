// 레시피 도메인 타입

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

// Supabase recipe_cache 테이블 행 타입
export interface RecipeCacheRow {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  ingredients: Ingredient[];
  steps: string[];
  coupang_links: CoupangLinks | null;
  raw_caption: string | null;
  created_at: string;
  updated_at: string;
}

// OpenAI Structured Outputs 응답 타입
export interface RecipeAnalysis {
  ingredients: Ingredient[];
  steps: string[];
}

// API Route 요청/응답 타입
export interface RecipeRequest {
  videoId: string;
}

export interface RecipeResponse {
  recipe: Recipe;
}
